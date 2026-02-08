import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `V☰RTEX | Journal`}];
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
  const hasBlogs = blogs?.nodes?.length > 0;

  return (
    <div className="min-h-screen page-fade-in">
      <div className="gradient-warm-seamless texture-canvas">
        <PageHero title="Journal" subtitle="Stories & Editorials" />

        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            {hasBlogs ? (
              <PaginatedResourceSection connection={blogs}>
                {({node: blog, index}) => (
                  <ScrollReveal key={blog.handle} delay={index * 100}>
                    <Link
                      prefetch="intent"
                      to={`/blogs/${blog.handle}`}
                      className="group block mb-8"
                    >
                      <article className="card-premium-light p-8 md:p-10">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal group-hover:text-rust transition-colors duration-300 mb-4">
                              {blog.title}
                            </h2>
                            {blog.seo?.description && (
                              <p className="text-sm text-charcoal/60 max-w-2xl leading-relaxed mb-4">
                                {blog.seo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 pt-4 border-t border-charcoal/10">
                              <span className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 group-hover:text-sand transition-colors duration-300">
                                Explore Articles
                              </span>
                              <span className="text-sm text-charcoal/40 group-hover:text-sand group-hover:translate-x-1 transition-all duration-300">
                                &rarr;
                              </span>
                            </div>
                          </div>
                          <div className="hidden md:block flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sand/20 to-rust/20 flex items-center justify-center group-hover:from-sand/30 group-hover:to-rust/30 transition-all duration-300">
                              <span className="text-2xl text-charcoal/40 group-hover:text-sand transition-colors duration-300">
                                &rarr;
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                )}
              </PaginatedResourceSection>
            ) : (
              <div className="max-w-2xl mx-auto">
                <ScrollReveal className="text-center py-20 card-premium-light p-12">
                  <div className="divider-sand max-w-xs mx-auto mb-8" />
                  <h3 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal mb-4">
                    Coming Soon
                  </h3>
                  <p className="text-charcoal/60 text-sm leading-relaxed max-w-md mx-auto mb-2">
                    We&apos;re crafting stories about design, materials, and the
                    process behind each <span style={{letterSpacing: '0.2em'}}>V<span className="trigram">☰</span>RTEX</span> collection.
                  </p>
                  <p className="text-charcoal/50 text-sm leading-relaxed max-w-md mx-auto mb-8">
                    Check back soon for editorials, behind-the-scenes features, and
                    style guides.
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
