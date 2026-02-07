import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

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
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <article className="section-padding">
        <div className="max-w-3xl mx-auto">
          {/* Meta line */}
          <div className="flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-6">
            <time dateTime={article.publishedAt}>{publishedDate}</time>
            {author?.name && (
              <>
                <span>&middot;</span>
                <address className="not-italic">{author.name}</address>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal leading-tight">
            {title}
          </h1>
        </div>

        {/* Hero image */}
        {image && (
          <div className="max-w-4xl mx-auto mt-10 overflow-hidden">
            <Image
              data={image}
              sizes="(min-width: 768px) 80vw, 100vw"
              loading="eager"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Article body */}
        <div className="max-w-3xl mx-auto mt-10">
          <div
            className="cms-prose"
            dangerouslySetInnerHTML={{__html: contentHtml}}
          />
        </div>
      </article>
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
