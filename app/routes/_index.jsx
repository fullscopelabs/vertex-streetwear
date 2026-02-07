import {useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Await} from 'react-router';
import {Money} from '@shopify/hydrogen';
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
  const heroProduct = data.coreCollection?.products?.nodes?.[0] ?? null;

  return (
    <>
      <HeroSection heroProduct={heroProduct} />
      <FeaturedProducts collection={data.coreCollection} />
      <EditorialHero heroProduct={heroProduct} />
      <BrandStory />
      <CollectionGrid collections={data.collections} />
      <NewsletterSection />
    </>
  );
}

/* ═══════════════════════════════════════════
 *  1. HERO SECTION
 * ═══════════════════════════════════════════ */

/**
 * @param {{heroProduct: CoreProductFragment | null}}
 */
function HeroSection({heroProduct}) {
  const heroImage = heroProduct?.featuredImage;

  return (
    <section className="relative h-screen bg-bone overflow-hidden">
      <div className="h-full flex flex-col md:flex-row">
        {/* Left — Editorial Text */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start px-8 md:px-16 lg:px-24 py-16 md:py-0 z-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal-light mb-6">
            Est. 2024
          </p>
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-charcoal leading-none">
            VΞRTEX
          </h1>
          {/* Decorative rule */}
          <div className="w-16 h-px bg-rust mt-6 mb-6" />
          <p className="text-sm tracking-[0.2em] text-charcoal-light uppercase">
            Contemporary Streetwear
          </p>
          <p className="text-xs tracking-widest text-charcoal/40 mt-2 uppercase">
            Premium Essentials for the Modern Urban
          </p>
          <div className="mt-10 flex gap-4">
            <Link to="/collections/all" className="btn-primary inline-block">
              Shop Now
            </Link>
            <Link
              to="/collections/core-collection"
              className="btn-secondary inline-block"
            >
              Core Collection
            </Link>
          </div>
        </div>

        {/* Right — Hero Image */}
        {heroImage && (
          <div className="flex-1 relative hidden md:block">
            <img
              src={heroImage.url}
              alt={heroImage.altText || 'VΞRTEX hero'}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Gradient fade into bone bg */}
            <div className="absolute inset-0 bg-gradient-to-r from-bone via-bone/40 to-transparent" />
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-charcoal/30"
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
 *  1b. EDITORIAL HERO PRODUCT
 * ═══════════════════════════════════════════ */

/**
 * @param {{heroProduct: CoreProductFragment | null}}
 */
function EditorialHero({heroProduct}) {
  if (!heroProduct) return null;

  const image = heroProduct.featuredImage;

  return (
    <section className="bg-charcoal text-bone overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-[500px] lg:min-h-[600px]">
        {/* Image — 60% */}
        {image && (
          <div className="w-full md:w-[60%] relative">
            <img
              src={image.url}
              alt={image.altText || heroProduct.title}
              className="w-full h-full object-cover min-h-[400px] md:min-h-0"
            />
          </div>
        )}

        {/* Text — 40% */}
        <div className="w-full md:w-[40%] flex flex-col justify-center px-8 md:px-12 lg:px-16 py-16 md:py-0">
          <p className="text-[10px] uppercase tracking-[0.35em] text-bone/40 mb-4">
            Featured
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {heroProduct.title}
          </h2>
          <div className="w-10 h-px bg-rust mt-6 mb-6" />
          <p className="text-bone/60 text-sm leading-relaxed">
            A cornerstone piece of the VΞRTEX collection. Designed for those
            who demand precision in every detail.
          </p>
          <p className="text-xl font-semibold mt-6 tracking-wide">
            <Money data={heroProduct.priceRange.minVariantPrice} />
          </p>
          <div className="mt-8">
            <Link
              to={`/products/${heroProduct.handle}`}
              className="inline-block bg-bone text-charcoal px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-rust hover:text-bone transition-all duration-300"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  NEWSLETTER SECTION
 * ═══════════════════════════════════════════ */
function NewsletterSection() {
  return (
    <section className="border-t border-charcoal/10 py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal">
          JOIN THE VΞRTEX COLLECTIVE
        </h2>
        <p className="text-charcoal-light text-sm mt-4 leading-relaxed">
          Be the first to know about new drops and exclusive releases.
        </p>
        <form
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 bg-transparent border border-charcoal/20 px-5 py-3.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal transition-colors duration-200"
          />
          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
        <p className="text-[11px] text-charcoal/30 mt-4 tracking-wider">
          No spam. Unsubscribe anytime.
        </p>
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
