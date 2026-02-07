import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
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

          {/* Remaining products in grid */}
          {remainingProducts.length > 0 && (
            <section className="section-padding">
              <div className="max-w-7xl mx-auto">
                <ScrollReveal className="mb-12">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal/40 text-center">
                    The Full Range
                  </p>
                </ScrollReveal>
                <div
                  className={
                    remainingProducts.length <= 2
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto'
                      : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                  }
                >
                  {remainingProducts.map((product, index) => (
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

/* ═══════════════════════════════════════════
 *  FEATURED PRODUCT — editorial hero for the first product
 * ═══════════════════════════════════════════ */

function FeaturedProduct({product}) {
  const image = product.featuredImage;

  return (
    <section className="bg-charcoal text-bone overflow-hidden grain">
      <div className="flex flex-col md:flex-row min-h-[450px] lg:min-h-[550px]">
        {/* Image — 60% */}
        {image && (
          <Link
            to={`/products/${product.handle}`}
            prefetch="intent"
            className="w-full md:w-[60%] relative overflow-hidden group"
          >
            <Image
              data={image}
              sizes="(min-width: 768px) 60vw, 100vw"
              loading="eager"
              className="w-full h-full object-cover min-h-[350px] md:min-h-0 group-hover:scale-[1.02] transition-transform duration-700"
            />
          </Link>
        )}

        {/* Text — 40% */}
        <div className="w-full md:w-[40%] flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12 md:py-0">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.35em] text-bone/40 mb-4">
              Featured
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-light tracking-tight leading-tight text-bone">
              {product.title}
            </h2>
            <div className="w-10 h-px bg-rust mt-5 mb-5" />
            <p className="text-xl font-semibold tracking-wide text-bone">
              <Money data={product.priceRange.minVariantPrice} />
            </p>
            <div className="mt-8">
              <Link
                to={`/products/${product.handle}`}
                prefetch="intent"
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
