import {useLoaderData, Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {ScrollReveal} from '~/components/ScrollReveal';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'V☰RTEX | Contemporary Streetwear'},
    {
      name: 'description',
      content:
        'V☰RTEX — contemporary streetwear essentials. Designed with intention, built to endure. Shop premium hoodies, outerwear, and accessories.',
    },
  ];
};

/**
 * Allowed checkout path prefixes for cookie-based redirect.
 * Must match the allowlist in password.jsx.
 */
const CHECKOUT_PATH_PREFIXES = ['/checkouts/', '/cart/c/'];

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Check for checkout_return_to cookie — if present, the user just
  // authenticated via the password page and should be sent to checkout
  const cookieHeader = args.request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/checkout_return_to=([^;]*)/);

  if (match) {
    let checkoutPath;
    try {
      checkoutPath = decodeURIComponent(match[1]).trim();
    } catch {
      checkoutPath = null;
    }

    // Validate: must be a relative checkout path (no open redirect)
    if (
      checkoutPath &&
      checkoutPath.startsWith('/') &&
      !checkoutPath.includes('://') &&
      !checkoutPath.startsWith('//') &&
      CHECKOUT_PATH_PREFIXES.some((p) => checkoutPath.startsWith(p))
    ) {
      const checkoutDomain =
        args.context.env.PUBLIC_CHECKOUT_DOMAIN ||
        args.context.env.PUBLIC_STORE_DOMAIN;
      const checkoutUrl = `https://${checkoutDomain}${checkoutPath}`;

      // Clear the cookie and redirect to checkout
      return new Response(null, {
        status: 307,
        headers: {
          Location: checkoutUrl,
          'Set-Cookie':
            'checkout_return_to=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
        },
      });
    }
  }

  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const [{collection}, {product: featuredProduct}] = await Promise.all([
    context.storefront.query(CORE_COLLECTION_QUERY, {
      variables: {handle: 'core-collection', first: 4},
      cache: context.storefront.CacheLong(),
    }),
    context.storefront.query(FEATURED_PRODUCT_QUERY, {
      variables: {handle: 'monolith-oversized-hoodie'},
      cache: context.storefront.CacheLong(),
    }),
  ]);

  return {
    coreCollection: collection,
    featuredProduct,
  };
}

/**
 * Load data for rendering content below the fold.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData() {
  return {};
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const heroProduct = data.coreCollection?.products?.nodes?.[0] ?? null;
  const featuredProduct = data.featuredProduct ?? heroProduct;

  return (
    <>
      <HeroSection heroProduct={heroProduct} />
      <BrandValues />
      <EditorialHero heroProduct={featuredProduct} />
      <BrandStory />
      <MarqueeBand />
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
          alt={heroImage.altText || 'V☰RTEX hero'}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}

      {/* Dark gradient overlays — top for header legibility, bottom for hero text */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />

      {/* Text content — positioned bottom-left, with top padding to clear fixed header */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end px-6 md:px-16 lg:px-24 pt-40 pb-16 md:pb-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-bone/50 mb-3 md:mb-4">
          Est. 2024
        </p>
        <h1
          className="font-serif text-[4rem] sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem] font-light text-bone leading-none"
          style={{letterSpacing: '0.12em'}}
        >
          <span className="inline-block" style={{letterSpacing: '0.15em'}}>
            V<span className="trigram">☰</span>RTEX
          </span>
        </h1>
        <div className="divider-lux mt-4 mb-4 md:mt-6 md:mb-6" />
        <p className="text-xs sm:text-sm tracking-[0.18em] sm:tracking-[0.2em] text-sand/70 uppercase">
          Contemporary Streetwear
        </p>
        <div className="mt-8 md:mt-10">
          <Link
            to="/collections/all"
            className="inline-block border border-sand/30 text-sand px-8 sm:px-10 py-3.5 sm:py-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] sm:tracking-[0.2em] hover:bg-sand hover:text-charcoal transition-all duration-500"
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
const MARQUEE_TEXT =
  'PRECISION CRAFTED  •  INTENTIONALLY DESIGNED  •  BUILT TO ENDURE  •  WEAR YOUR VISION  •  WHERE AMBITION MEETS EXECUTION  •  EST. 2024  •  '.repeat(
    4,
  );

function MarqueeBand() {
  return (
    <section className="bg-charcoal overflow-hidden py-5 border-y border-charcoal">
      <div className="animate-marquee whitespace-nowrap flex-shrink-0">
        <span className="text-bone/50 text-[11px] uppercase tracking-[0.3em] font-medium">
          {MARQUEE_TEXT}
        </span>
        <span className="text-bone/50 text-[11px] uppercase tracking-[0.3em] font-medium">
          {MARQUEE_TEXT}
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
    <section className="bg-gradient-to-br from-charcoal via-charcoal to-tobacco text-bone overflow-hidden grain dark-accent-border">
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
            <p className="text-[10px] uppercase tracking-[0.35em] text-sand/50 mb-4">
              Featured
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light tracking-tight leading-tight text-bone">
              {heroProduct.title}
            </h2>
            <div className="divider-lux mt-6 mb-6" />
            <p className="text-bone/60 text-sm leading-relaxed">
              A cornerstone piece of the{' '}
              <span style={{letterSpacing: '0.2em'}}>
                V<span className="trigram">☰</span>RTEX
              </span>{' '}
              collection. Designed for those who demand precision in every
              detail.
            </p>
            <div className="text-xl font-light mt-6 tracking-wide text-bone tabular-nums">
              <Money data={heroProduct.priceRange.minVariantPrice} />
            </div>
            <div className="mt-8">
              <Link
                to={`/products/${heroProduct.handle}`}
                className="inline-block border border-sand/30 text-sand px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-sand hover:text-charcoal transition-all duration-500"
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
    <section className="bg-charcoal dark-accent-border">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          {VALUES.map((item, i) => (
            <div
              key={item.label}
              className={`text-center ${
                i < VALUES.length - 1 ? 'md:border-r md:border-sand/10' : ''
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-bone/80">
                {item.number}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-bone/50 mt-1">
                {item.label}
              </p>
            </div>
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
    <section className="bg-gradient-to-br from-forest via-tobacco to-charcoal/90 relative overflow-hidden grain dark-accent-border py-28 md:py-40 px-4">
      <ScrollReveal className="max-w-2xl mx-auto text-center relative z-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-sand/60 mb-6">
          Our Philosophy
        </p>
        <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone mb-8">
          Crafted for the Modern Urbanite
        </h2>
        <div className="divider-lux mx-auto mb-10" />
        <p className="text-bone/80 leading-relaxed text-lg">
          Every{' '}
          <span style={{letterSpacing: '0.2em'}}>
            V<span className="trigram">☰</span>RTEX
          </span>{' '}
          piece begins with intention. We source premium fabrics and work with
          skilled artisans to create streetwear that stands the test of time —
          both in durability and design. Our collections are rooted in the
          belief that contemporary style should be accessible, sustainable, and
          unapologetically bold.
        </p>
        <p className="text-bone/50 leading-relaxed mt-6">
          From the cut of each silhouette to the weight of every fabric, we
          obsess over the details so you don&apos;t have to. This is streetwear
          engineered for real life.
        </p>
        <div className="mt-12">
          <Link
            to="/collections/all"
            className="inline-block border border-sand/30 text-sand px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-sand hover:text-charcoal transition-all duration-500"
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

const FEATURED_PRODUCT_QUERY = `#graphql
  query FeaturedProduct(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
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
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */

/**
 * @typedef {NonNullable<CoreCollectionQuery['collection']>['products']['nodes'][number]} CoreProductFragment
 * @typedef {import('storefrontapi.generated').CoreCollectionQuery} CoreCollectionQuery
 */
