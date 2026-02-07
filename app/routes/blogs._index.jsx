import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `VERTEX | Journal`}];
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
async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
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

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {blogs} = useLoaderData();

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <PageHero title="Journal" subtitle="Stories & Editorials" />

      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
          <PaginatedResourceSection connection={blogs}>
            {({node: blog, index}) => (
              <ScrollReveal key={blog.handle} delay={index * 100}>
                <Link
                  prefetch="intent"
                  to={`/blogs/${blog.handle}`}
                  className="group flex items-center justify-between py-8 border-b border-charcoal/10 first:pt-0"
                >
                  <div>
                    <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal group-hover:text-rust transition-colors duration-300">
                      {blog.title}
                    </h2>
                    {blog.seo?.description && (
                      <p className="text-sm text-charcoal/50 mt-2 max-w-lg leading-relaxed">
                        {blog.seo.description}
                      </p>
                    )}
                    <span className="inline-block mt-3 text-xs uppercase tracking-[0.15em] text-charcoal/40 group-hover:text-rust transition-colors duration-300">
                      Read More
                    </span>
                  </div>
                  <span className="text-charcoal/20 group-hover:text-rust group-hover:translate-x-1 transition-all duration-300 text-xl ml-6 flex-shrink-0">
                    &rarr;
                  </span>
                </Link>
              </ScrollReveal>
            )}
          </PaginatedResourceSection>
        </div>
      </section>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
`;

/** @typedef {BlogsQuery['blogs']['nodes'][0]} BlogNode */

/** @typedef {import('./+types/blogs._index').Route} Route */
/** @typedef {import('storefrontapi.generated').BlogsQuery} BlogsQuery */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
