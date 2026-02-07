import {Link, useLoaderData} from 'react-router';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `VERTEX | ${data?.blog.title ?? ''}`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  if (!params.blogHandle) {
    throw new Response(`blog not found`, {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        blogHandle: params.blogHandle,
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articles) {
    throw new Response('Not found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});

  return {blog};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Blog() {
  /** @type {LoaderReturnData} */
  const {blog} = useLoaderData();
  const {articles} = blog;
  const hasArticles = articles?.nodes?.length > 0;

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <PageHero title={blog.title} subtitle="Stories & Editorials" />

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {hasArticles ? (
            <PaginatedResourceSection
              connection={articles}
              resourcesClassName="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {({node: article, index}) => (
                <ScrollReveal key={article.id} delay={index * 100}>
                  <ArticleItem
                    article={article}
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                </ScrollReveal>
              )}
            </PaginatedResourceSection>
          ) : (
            <ScrollReveal className="text-center py-16">
              <div className="w-12 h-px bg-rust mx-auto mb-8" />
              <h3 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal mb-4">
                Stories Coming Soon
              </h3>
              <p className="text-charcoal/50 text-sm leading-relaxed max-w-md mx-auto mb-8">
                New articles are on the way. In the meantime, explore our
                latest collections.
              </p>
              <Link
                to="/collections/all"
                className="btn-secondary inline-block"
              >
                Shop the Collection
              </Link>
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  );
}

/**
 * @param {{
 *   article: ArticleItemFragment;
 *   loading?: HTMLImageElement['loading'];
 * }}
 */
function ArticleItem({article, loading}) {
  const publishedAt = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="group block"
      key={article.id}
    >
      {article.image && (
        <div className="relative aspect-[3/2] overflow-hidden bg-bone-dark mb-4">
          <Image
            alt={article.image.altText || article.title}
            aspectRatio="3/2"
            data={article.image}
            loading={loading}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-rust scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      )}
      <p className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-2">
        {publishedAt}
      </p>
      <h3 className="font-serif text-xl font-normal tracking-tight text-charcoal group-hover:text-rust transition-colors duration-200">
        {article.title}
      </h3>
    </Link>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title
      handle
      seo {
        title
        description
      }
      articles(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ArticleItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          hasNextPage
          endCursor
          startCursor
        }

      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 {
      name
    }
    contentHtml
    handle
    id
    image {
      id
      altText
      url
      width
      height
    }
    publishedAt
    title
    blog {
      handle
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle._index').Route} Route */
/** @typedef {import('storefrontapi.generated').ArticleItemFragment} ArticleItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
