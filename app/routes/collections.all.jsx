import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/ProductCard';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'All Products | VΞRTEX'},
    {
      name: 'description',
      content: 'Shop the full VΞRTEX collection — premium streetwear essentials.',
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
  const productCount = products.nodes.length;

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      {/* Dark Hero Band */}
      <PageHero title="All Products" subtitle="The Full Collection">
        <p className="text-[10px] tracking-[0.3em] text-bone/40 uppercase">
          {productCount} {productCount === 1 ? 'Product' : 'Products'}
        </p>
      </PageHero>

      {/* Filter / Sort Bar */}
      <section className="border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal border border-charcoal/20 px-4 py-2 hover:border-charcoal/40 transition-colors duration-200">
              Filter
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-charcoal/50">Sort by</span>
            <button className="flex items-center gap-2 text-xs uppercase tracking-widest text-charcoal border border-charcoal/20 px-4 py-2 hover:border-charcoal/40 transition-colors duration-200">
              Featured
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          {productCount > 0 ? (
            <PaginatedResourceSection
              connection={products}
              resourcesClassName="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {({node: product, index}) => (
                <ScrollReveal key={product.id} delay={index * 75}>
                  <ProductCard
                    product={product}
                    loading={index < 8 ? 'eager' : 'lazy'}
                  />
                </ScrollReveal>
              )}
            </PaginatedResourceSection>
          ) : (
            <div className="text-center py-20">
              <p className="text-charcoal/50 text-lg mb-6">
                No products available yet.
              </p>
              <Link to="/" className="btn-primary inline-block">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>
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
