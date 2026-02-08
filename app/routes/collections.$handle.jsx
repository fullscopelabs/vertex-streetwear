import {redirect, useLoaderData, Link} from 'react-router';
import {Analytics, Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {FeaturedProduct} from '~/components/FeaturedProduct';
import {EditorialGrid} from '~/components/EditorialGrid';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.collection?.title ?? 'Collection';
  return [
    {title: `${title} | V☰RTEX`},
    {
      name: 'description',
      content: data?.collection?.description ?? `Shop the ${title} collection at V☰RTEX.`,
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

/** Definition text for known collection handles */
const COLLECTION_DEFINITIONS = {
  'core': 'the essential. what everything else is built on.',
  'core-collection': 'the essential. what everything else is built on.',
  'limited': 'made once. never again.',
  'limited-edition': 'made once. never again.',
  'outerwear': 'the outer layer. protection meets presence.',
  'accessories': 'the finishing details. where intention lives.',
};

function getCollectionDefinition(handle) {
  return COLLECTION_DEFINITIONS[handle] || 'undefined. see for yourself.';
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {collection} = useLoaderData();
  const products = collection.products.nodes;
  const productCount = products.length;

  const hasImage = !!collection.image;

  return (
    <div className="min-h-screen page-fade-in texture-canvas">
      {/* Hero Banner */}
      {hasImage ? (
        <section className="relative h-[240px] md:h-[320px] overflow-hidden grain">
          <Image
            data={collection.image}
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-charcoal/40 to-charcoal/80" />
          <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(196,168,124,0.05) 0%, transparent 70%)'}} />
          {/* Content centered on top */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <ScrollReveal>
              <p className="text-[10px] tracking-[0.35em] uppercase text-sand/50 mb-3">
                Collection
              </p>
              <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone">
                {collection.title}
              </h1>
              <p className="font-serif italic text-sm text-bone/40 mt-2 tracking-wide">
                /{collection.title.toLowerCase()}/
              </p>
              <p className="text-bone/30 text-xs mt-1 italic">
                {getCollectionDefinition(collection.handle)}
              </p>
              <div className="divider-lux mx-auto mt-5" />
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
          <p className="font-serif italic text-sm text-bone/40 mt-2 tracking-wide">
            /{collection.title.toLowerCase()}/
          </p>
          <p className="text-bone/30 text-xs mt-1 italic">
            {getCollectionDefinition(collection.handle)}
          </p>
          {collection.description && (
            <p className="text-bone/60 max-w-xl mx-auto text-sm leading-relaxed mt-3">
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

          {/* Remaining products — editorial staggered grid */}
          {products.length > 1 && (
            <EditorialGrid
              products={products.slice(1)}
              sectionLabel={`More from ${collection.title}`}
            />
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
