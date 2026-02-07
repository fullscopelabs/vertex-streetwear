import {useLoaderData, Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {ProductCard} from '~/components/ProductCard';
import {ScrollReveal} from '~/components/ScrollReveal';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'VĒRTEX | Contemporary Streetwear'}];
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
  return {};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const heroProduct = data.coreCollection?.products?.nodes?.[0] ?? null;

  return (
    <>
      <HeroSection heroProduct={heroProduct} />
      <FeaturedProducts collection={data.coreCollection} />
      <MarqueeBand />
      <EditorialHero heroProduct={heroProduct} />
      <BrandValues />
      <BrandStory />
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
    <section className="relative min-h-screen bg-charcoal overflow-hidden">
      {/* Full-bleed background image */}
      {heroImage && (
        <img
          src={heroImage.url}
          alt={heroImage.altText || 'VĒRTEX hero'}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Dark gradient overlays — top for header legibility, bottom for hero text */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />

      {/* Text content — positioned bottom-left, with top padding to clear fixed header */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end px-8 md:px-16 lg:px-24 pt-40 pb-16 md:pb-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-bone/50 mb-4">
          Est. 2024
        </p>
        <h1 className="font-serif text-8xl md:text-9xl lg:text-[11rem] font-light tracking-tight text-bone leading-none">
          VĒRTEX
        </h1>
        <div className="w-16 h-px bg-rust mt-6 mb-6" />
        <p className="text-sm tracking-[0.2em] text-bone/70 uppercase">
          Contemporary Streetwear
        </p>
        <div className="mt-10">
          <Link
            to="/collections/all"
            className="inline-block bg-bone text-charcoal px-10 py-4 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-rust hover:text-bone transition-all duration-300"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  1b. MARQUEE DIVIDER BAND
 * ═══════════════════════════════════════════ */
function MarqueeBand() {
  const text = 'PREMIUM STREETWEAR  •  EST. 2024  •  DESIGNED WITH INTENTION  •  BUILT TO ENDURE  •  ';
  const repeated = text.repeat(4);

  return (
    <section className="bg-charcoal overflow-hidden py-5 border-y border-charcoal">
      <div className="animate-marquee whitespace-nowrap flex-shrink-0">
        <span className="text-bone/30 text-[11px] uppercase tracking-[0.3em] font-medium">
          {repeated}
        </span>
        <span className="text-bone/30 text-[11px] uppercase tracking-[0.3em] font-medium">
          {repeated}
        </span>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  1c. EDITORIAL HERO PRODUCT
 * ═══════════════════════════════════════════ */

/**
 * @param {{heroProduct: CoreProductFragment | null}}
 */
function EditorialHero({heroProduct}) {
  if (!heroProduct) return null;

  const image = heroProduct.featuredImage;

  return (
    <section className="bg-charcoal text-bone overflow-hidden grain">
      <div className="flex flex-col md:flex-row min-h-[500px] lg:min-h-[600px]">
        {/* Image — 60% */}
        {image && (
          <div className="w-full md:w-[60%] relative overflow-hidden">
            <img
              src={image.url}
              alt={image.altText || heroProduct.title}
              className="w-full h-full object-cover min-h-[400px] md:min-h-0"
            />
          </div>
        )}

        {/* Text — 40% */}
        <div className="w-full md:w-[40%] flex flex-col justify-center px-8 md:px-12 lg:px-16 py-16 md:py-0">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-bone/40 mb-4">
              Featured
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light tracking-tight leading-tight text-bone">
              {heroProduct.title}
            </h2>
            <div className="w-10 h-px bg-rust mt-6 mb-6" />
            <p className="text-bone/60 text-sm leading-relaxed">
              A cornerstone piece of the VĒRTEX collection. Designed for those
              who demand precision in every detail.
            </p>
            <p className="text-xl font-semibold mt-6 tracking-wide text-bone">
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
          </ScrollReveal>
        </div>
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
    <section className="section-feature">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-charcoal">
            Core Collection
          </h2>
          <p className="text-charcoal/60 mt-3 tracking-wide text-sm">
            Essential pieces built to last
          </p>
        </ScrollReveal>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 100}>
                <ProductCard
                  product={product}
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <p className="text-center text-charcoal/40">
            Products coming soon.
          </p>
        )}

        <ScrollReveal className="text-center mt-12">
          <Link
            to="/collections/core-collection"
            className="btn-secondary inline-block"
          >
            View All
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  2b. BRAND VALUES STRIP
 * ═══════════════════════════════════════════ */
const VALUES = [
  {number: 'Curated', label: 'Collection'},
  {number: 'Free', label: 'Shipping Over $200'},
  {number: '100%', label: 'Premium Fabrics'},
  {number: 'Dedicated', label: 'Customer Support'},
];

function BrandValues() {
  return (
    <section className="bg-bone-dark border-y border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {VALUES.map((item, i) => (
            <ScrollReveal key={item.label} delay={i * 80}>
              <div className="text-center">
                <p className="font-serif text-3xl md:text-4xl font-light tracking-tight text-charcoal">
                  {item.number}
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-charcoal/40 mt-2">
                  {item.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
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
    <section className="bg-gradient-to-br from-forest via-[#1E4234] to-charcoal/90 section-editorial relative overflow-hidden grain">
      <ScrollReveal className="max-w-2xl mx-auto text-center relative z-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-bone/40 mb-6">
          Our Philosophy
        </p>
        <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone mb-8">
          Crafted for the Modern Urbanite
        </h2>
        <div className="w-12 h-px bg-rust mx-auto mb-8" />
        <p className="text-bone/80 leading-relaxed text-lg">
          Every VĒRTEX piece begins with intention. We source premium fabrics and
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
        <div className="mt-10">
          <Link
            to="/collections/all"
            className="inline-block border border-bone/30 text-bone px-8 py-4 text-sm font-semibold uppercase tracking-[0.12em] hover:bg-bone hover:text-charcoal transition-all duration-300"
          >
            Discover More
          </Link>
        </div>
      </ScrollReveal>
    </section>
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

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

/**
 * @typedef {NonNullable<CoreCollectionQuery['collection']>['products']['nodes'][number]} CoreProductFragment
 * @typedef {import('storefrontapi.generated').CoreCollectionQuery} CoreCollectionQuery
 */
