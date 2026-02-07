import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {FeaturedProduct} from '~/components/FeaturedProduct';
import {EditorialGrid} from '~/components/EditorialGrid';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'All Products | V☰RTEX'},
    {
      name: 'description',
      content: 'Shop the full V☰RTEX collection — premium streetwear essentials.',
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
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 50,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
  ]);
  return {products};
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function AllProducts() {
  /** @type {LoaderReturnData} */
  const {products} = useLoaderData();
  const allNodes = products.nodes;
  const productCount = allNodes.length;
  const featuredProduct = allNodes[0] ?? null;
  const remainingProducts = allNodes.slice(1);

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      {/* Dark Hero Band */}
      <PageHero title="All Products" subtitle="The Full Collection">
        <p className="text-[10px] tracking-[0.3em] text-bone/40 uppercase">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>
      </PageHero>

      {productCount > 0 ? (
        <>
          {/* Featured first product — editorial hero */}
          {featuredProduct && (
            <FeaturedProduct product={featuredProduct} />
          )}

          {/* Remaining products — editorial staggered grid */}
          {remainingProducts.length > 0 && (
            <EditorialGrid
              products={remainingProducts}
              sectionLabel="The Full Range"
            />
          )}
        </>
      ) : (
        <section className="section-padding">
          <div className="max-w-7xl mx-auto text-center py-20">
            <p className="text-charcoal/50 text-lg mb-6">
              No products available yet.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Back to Home
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
`;

const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
