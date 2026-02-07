import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

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
    pageBy: 8,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
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

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'VΞRTEX | Collections'}];
};

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <PageHero title="Collections" subtitle="Explore Our Range" />

      {/* Collection grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <PaginatedResourceSection
            connection={collections}
            resourcesClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {({node: collection, index}) => (
              <ScrollReveal
                key={collection.id}
                delay={index * 100}
                className={index === 0 ? 'md:col-span-2' : ''}
              >
                <CollectionItem
                  collection={collection}
                  index={index}
                  featured={index === 0}
                />
              </ScrollReveal>
            )}
          </PaginatedResourceSection>
        </div>
      </section>
    </div>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 *   featured?: boolean;
 * }}
 */
function CollectionItem({collection, index, featured = false}) {
  return (
    <Link
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      className={`group relative block overflow-hidden ${featured ? 'aspect-[21/9]' : 'aspect-[4/3]'}`}
    >
      {collection?.image ? (
        <Image
          alt={collection.image.altText || collection.title}
          data={collection.image}
          loading={index < 3 ? 'eager' : undefined}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="absolute inset-0 bg-charcoal/10" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-charcoal/40 group-hover:bg-charcoal/50 transition-colors duration-300" />

      {/* Text centered */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight text-bone">
          {collection.title}
        </h2>
        <span className="mt-3 text-[10px] uppercase tracking-[0.3em] text-bone/60 group-hover:text-bone/80 transition-colors duration-200">
          View Collection
        </span>
      </div>

      {/* Bottom accent */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-rust scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('./+types/collections._index').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
