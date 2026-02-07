import {redirect, useLoaderData, Link} from 'react-router';
import {Analytics, Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductCard} from '~/components/ProductCard';
import {FeaturedProduct} from '~/components/FeaturedProduct';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.collection?.title ?? 'Collection';
  return [
    {title: `${title} | VĒRTEX`},
    {
      name: 'description',
      content: data?.collection?.description ?? `Shop the ${title} collection at VĒRTEX.`,
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

      {/* Products */}
      {productCount > 0 ? (
        <>
          {/* Featured first product — editorial hero */}
          <FeaturedProduct product={products[0]} />

          {/* Remaining products */}
          {products.length > 1 && (
            <section className="section-padding">
              <div className="max-w-7xl mx-auto">
                <ScrollReveal className="mb-12">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal/40 text-center">
                    More from {collection.title}
                  </p>
                </ScrollReveal>
                <div
                  className={
                    products.length <= 3
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto'
                      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  }
                >
                  {products.slice(1).map((product, index) => (
                    <ScrollReveal key={product.id} delay={index * 75}>
                      <ProductCard
                        product={product}
                        loading={index < 8 ? 'eager' : 'lazy'}
                      />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="section-padding">
          <div className="max-w-7xl mx-auto text-center py-20">
            <p className="text-charcoal/50 text-lg mb-6">
              No products in this collection yet.
            </p>
            <Link to="/collections/all" className="btn-primary inline-block">
              Shop All
            </Link>
          </div>
        </section>
      )}

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
