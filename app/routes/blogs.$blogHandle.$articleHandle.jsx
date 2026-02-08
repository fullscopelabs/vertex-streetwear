import {useLoaderData, Link, useParams} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ScrollReveal} from '~/components/ScrollReveal';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `VERTEX | ${data?.article.title ?? ''}`}];
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
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Not found', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article};
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

export default function Article() {
  /** @type {LoaderReturnData} */
  const {article} = useLoaderData();
  const {blogHandle} = useParams();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="min-h-screen page-fade-in">
      {/* Premium dark header with enhanced gradient */}
      <section className="relative bg-gradient-to-br from-charcoal via-tobacco to-forest overflow-hidden grain dark-accent-border">
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
          <ScrollReveal>
            {/* Back to journal */}
            <Link
              to={`/blogs/${blogHandle}`}
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-sand/50 hover:text-sand transition-colors duration-300 mb-10"
            >
              <span>&larr;</span>
              <span>Back to Journal</span>
            </Link>

            {/* Meta line with enhanced styling */}
            <div className="flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase text-sand/50 mb-6">
              <time dateTime={article.publishedAt}>{publishedDate}</time>
              {author?.name && (
                <>
                  <span className="text-sand/30">&middot;</span>
                  <address className="not-italic">By {author.name}</address>
                </>
              )}
            </div>

            {/* Title with better spacing */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-bone leading-tight mb-8">
              {title}
            </h1>
            <div className="divider-sand max-w-xs" />
          </ScrollReveal>
        </div>
      </section>

      {/* Content wrapper with gradient */}
      <div className="bg-gradient-to-b from-bone to-bone-dark">
        <article>
          {/* Hero image with premium framing */}
          {image && (
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
              <ScrollReveal>
                <div className="relative overflow-hidden border border-charcoal/10 bg-bone-dark/40 backdrop-blur-sm p-4 md:p-6">
                  <Image
                    data={image}
                    sizes="(min-width: 768px) 80vw, 100vw"
                    loading="eager"
                    className="w-full h-auto"
                  />
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* Article body with premium card */}
          <div className="max-w-4xl mx-auto px-4 pb-16 md:pb-20">
            <ScrollReveal>
              <div className="bg-bone-dark/40 backdrop-blur-sm border border-charcoal/8 p-8 md:p-12 lg:p-16">
                <div
                  className="cms-prose text-base md:text-lg leading-relaxed"
                  dangerouslySetInnerHTML={{__html: contentHtml}}
                />
              </div>
            </ScrollReveal>
          </div>
        </article>

        {/* Back to journal CTA with premium styling */}
        <section className="border-t border-charcoal/10 bg-bone">
          <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 text-center">
            <ScrollReveal>
              <div className="divider-sand max-w-xs mx-auto mb-8" />
              <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/40 mb-6">
                Continue Reading
              </p>
              <Link
                to={`/blogs/${blogHandle}`}
                className="btn-secondary inline-block"
              >
                Back to Journal
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
`;

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
