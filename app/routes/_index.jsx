import {useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Await} from 'react-router';
import {ProductCard} from '~/components/ProductCard';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'VΞRTEX | Contemporary Streetwear'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const [{collection}] = await Promise.all([
    context.storefront.query(CORE_COLLECTION_QUERY, {
      variables: {handle: 'core-collection', first: 4},
    }),
  ]);

  return {
    coreCollection: collection,
  };
}

/**
 * Load data for rendering content below the fold.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const collections = context.storefront
    .query(COLLECTIONS_GRID_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
    });

  return {collections};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();

  return (
    <>
      <HeroSection />
      <FeaturedProducts collection={data.coreCollection} />
      <BrandStory />
      <CollectionGrid collections={data.collections} />
    </>
  );
}

/* ═══════════════════════════════════════════
 *  1. HERO SECTION
 * ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative flex items-center justify-center h-screen bg-bone overflow-hidden">
      <div className="text-center z-10">
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-charcoal">
          VΞRTEX
        </h1>
        <p className="text-sm tracking-widest text-charcoal/60 mt-4 uppercase">
          Contemporary Streetwear
        </p>
        <div className="mt-10">
          <Link to="/collections/all" className="btn-primary inline-block">
            Explore Collection
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 text-charcoal/40"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  2. FEATURED PRODUCTS SECTION
 * ═══════════════════════════════════════════ */

/**
 * @param {{collection: CoreCollectionQuery['collection'] | null}}
 */
function FeaturedProducts({collection}) {
  const products = collection?.products?.nodes;

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tighter text-charcoal">
            CORE COLLECTION
          </h2>
          <p className="text-charcoal/60 mt-3 tracking-wide text-sm">
            Essential pieces built to last
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-charcoal/40">
            Products coming soon.
          </p>
        )}

        <div className="text-center mt-12">
          <Link
            to="/collections/core-collection"
            className="btn-secondary inline-block"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  3. BRAND STORY SECTION
 * ═══════════════════════════════════════════ */
function BrandStory() {
  return (
    <section className="bg-forest py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold tracking-tighter text-bone mb-8">
          CRAFTED FOR THE MODERN URBAN
        </h2>
        <p className="text-bone/80 leading-relaxed text-lg">
          Every VΞRTEX piece begins with intention. We source premium fabrics and
          work with skilled artisans to create streetwear that stands the test of
          time — both in durability and design. Our collections are rooted in the
          belief that contemporary style should be accessible, sustainable, and
          unapologetically bold.
        </p>
        <p className="text-bone/60 leading-relaxed mt-6">
          From the cut of each silhouette to the weight of every fabric, we obsess
          over the details so you don&apos;t have to. This is streetwear
          engineered for real life.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  4. COLLECTION GRID
 * ═══════════════════════════════════════════ */

const COLLECTION_CARDS = [
  {handle: 'core-collection', label: 'Core'},
  {handle: 'outerwear', label: 'Outerwear'},
  {handle: 'accessories', label: 'Accessories'},
  {handle: 'limited-edition', label: 'Limited Edition'},
];

/**
 * @param {{collections: Promise<CollectionsGridQuery | null>}}
 */
function CollectionGrid({collections}) {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter text-charcoal text-center mb-16">
          COLLECTIONS
        </h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {COLLECTION_CARDS.map((card) => (
                <div
                  key={card.handle}
                  className="aspect-square bg-charcoal/5 animate-pulse"
                />
              ))}
            </div>
          }
        >
          <Await resolve={collections}>
            {(response) => {
              const nodes = response?.collections?.nodes ?? [];
              return (
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {COLLECTION_CARDS.map((card) => {
                    const collection = nodes.find(
                      (c) => c.handle === card.handle,
                    );
                    return (
                      <CollectionCard
                        key={card.handle}
                        handle={card.handle}
                        label={card.label}
                        image={collection?.image}
                      />
                    );
                  })}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}

/**
 * @param {{handle: string; label: string; image?: {url: string; altText?: string | null} | null}}
 */
function CollectionCard({handle, label, image}) {
  return (
    <Link
      to={`/collections/${handle}`}
      prefetch="intent"
      className="group relative aspect-square bg-charcoal flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
    >
      {image && (
        <img
          src={image.url}
          alt={image.altText || label}
          className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-300 group-hover:opacity-30"
        />
      )}
      <div className="relative z-10 text-center">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tighter text-bone transition-colors duration-300 group-hover:text-rust">
          {label}
        </h3>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-rust scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
    </Link>
  );
}

/* ═══════════════════════════════════════════
 *  GRAPHQL QUERIES
 * ═══════════════════════════════════════════ */

const CORE_COLLECTION_QUERY = `#graphql
  fragment CoreProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query CoreCollection(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first) {
        nodes {
          ...CoreProduct
        }
      }
    }
  }
`;

const COLLECTIONS_GRID_QUERY = `#graphql
  query CollectionsGrid($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 10) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

/**
 * @typedef {NonNullable<CoreCollectionQuery['collection']>['products']['nodes'][number]} CoreProductFragment
 * @typedef {import('storefrontapi.generated').CoreCollectionQuery} CoreCollectionQuery
 * @typedef {import('storefrontapi.generated').CollectionsGridQuery} CollectionsGridQuery
 */
