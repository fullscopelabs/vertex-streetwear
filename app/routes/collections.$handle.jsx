import {redirect, useLoaderData, Link} from 'react-router';
import {Analytics, Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductCard} from '~/components/ProductCard';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.collection?.title ?? 'Collection';
  return [
    {title: `${title} | VΞRTEX`},
    {
      name: 'description',
      content: data?.collection?.description ?? `Shop the ${title} collection at VΞRTEX.`,
    },
  ];
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, first: 50},
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {collection};
}

/**
 * Load data for rendering content below the fold.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const products = collection.products.nodes;
  const productCount = products.length;

  const hasImage = !!collection.image;

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      {/* Hero Banner */}
      {hasImage ? (
        <section className="relative h-[300px] md:h-[400px] overflow-hidden grain">
          <Image
            data={collection.image}
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-charcoal/40 to-charcoal/70" />
          {/* Content centered on top */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <ScrollReveal>
              <p className="text-[10px] tracking-[0.35em] uppercase text-bone/40 mb-3">
                Collection
              </p>
              <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone">
                {collection.title}
              </h1>
              <div className="w-12 h-px bg-rust mx-auto mt-5" />
              {collection.description && (
                <p className="text-bone/60 mt-4 max-w-xl text-sm leading-relaxed">
                  {collection.description}
                </p>
              )}
              <p className="text-[10px] tracking-[0.3em] text-bone/40 mt-4 uppercase">
                {productCount} {productCount === 1 ? 'Product' : 'Products'}
              </p>
            </ScrollReveal>
          </div>
        </section>
      ) : (
        <PageHero title={collection.title} subtitle="Collection">
          {collection.description && (
            <p className="text-bone/60 max-w-xl mx-auto text-sm leading-relaxed">
              {collection.description}
            </p>
          )}
          <p className="text-[10px] tracking-[0.3em] text-bone/40 mt-3 uppercase">
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </p>
        </PageHero>
      )}

      {/* Filter / Sort Bar */}
      <section className="border-y border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal border border-charcoal/20 px-4 py-2 hover:border-charcoal/40 transition-colors duration-200">
              Filter
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-charcoal/50">
              Sort by
            </span>
            <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal border border-charcoal/20 px-4 py-2 hover:border-charcoal/40 transition-colors duration-200">
              Featured
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid or Empty State */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {productCount > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ScrollReveal key={product.id} delay={index * 75}>
                  <ProductCard
                    product={product}
                    loading={index < 8 ? 'eager' : 'lazy'}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-charcoal/50 text-lg mb-6">
                No products in this collection yet.
              </p>
              <Link to="/collections/all" className="btn-primary inline-block">
                Shop All
              </Link>
            </div>
          )}
        </div>
      </section>

      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  GRAPHQL QUERIES
 * ═══════════════════════════════════════════ */

const COLLECTION_PRODUCT_FRAGMENT = `#graphql
  fragment CollectionProduct on Product {
    id
    title
    handle
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${COLLECTION_PRODUCT_FRAGMENT}
  query CollectionByHandle(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first, sortKey: BEST_SELLING) {
        nodes {
          ...CollectionProduct
        }
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
