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
    <div className="min-h-screen page-fade-in">
      {/* Premium gradient background */}
      <div className="bg-gradient-to-b from-bone-dark via-bone to-bone">
        <PageHero title={blog.title} subtitle="Stories & Editorials" />

        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            {hasArticles ? (
              <PaginatedResourceSection
                connection={articles}
                resourcesClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
              >
                {({node: article, index}) => (
                  <ScrollReveal key={article.id} delay={index * 100}>
                    <ArticleItem
                      article={article}
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                  </ScrollReveal>
                )}
              </PaginatedResourceSection>
            ) : (
              <div className="max-w-2xl mx-auto">
                <ScrollReveal className="text-center py-20 bg-bone-dark/40 backdrop-blur-sm border border-charcoal/8 p-12">
                  <div className="divider-sand max-w-xs mx-auto mb-8" />
                  <h3 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal mb-4">
                    Stories Coming Soon
                  </h3>
                  <p className="text-charcoal/60 text-sm leading-relaxed max-w-md mx-auto mb-8">
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
              </div>
            )}
          </div>
        </section>
      </div>
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
      className="group block h-full"
      key={article.id}
    >
      <article className="h-full flex flex-col bg-bone-dark/40 backdrop-blur-sm border border-charcoal/8 overflow-hidden hover:border-sand/30 transition-all duration-500 hover:shadow-lg">
        {article.image && (
          <div className="relative aspect-[4/3] overflow-hidden bg-charcoal/5">
            <Image
              alt={article.image.altText || article.title}
              aspectRatio="4/3"
              data={article.image}
              loading={loading}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Premium accent line */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-sand to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>
        )}
        
        <div className="flex-1 flex flex-col p-6">
          {/* Date */}
          <time 
            dateTime={article.publishedAt}
            className="text-[10px] tracking-[0.25em] uppercase text-sand/60 mb-3 font-medium"
          >
            {publishedAt}
          </time>
          
          {/* Title */}
          <h3 className="font-serif text-xl md:text-2xl font-light tracking-tight text-charcoal group-hover:text-rust transition-colors duration-300 leading-tight mb-4">
            {article.title}
          </h3>
          
          {/* Read more indicator */}
          <div className="mt-auto pt-4 border-t border-charcoal/10">
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 group-hover:text-sand group-hover:gap-3 transition-all duration-300">
              <span>Read Article</span>
              <span className="text-sm">&rarr;</span>
            </span>
          </div>
        </div>
      </article>
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
        after: $endCursor,
        reverse: true
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
