import {useState, Suspense} from 'react';
import {useLoaderData, Link, useNavigate, Await} from 'react-router';
import {
  Image,
  Money,
  CartForm,
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductCard} from '~/components/ProductCard';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.product?.title ?? 'Product';
  return [
    {title: `${title} | VΞRTEX`},
    {
      name: 'description',
      content:
        data?.product?.description ??
        `Shop ${title} at VΞRTEX — premium streetwear essentials.`,
    },
    {
      rel: 'canonical',
      href: `/products/${data?.product?.handle}`,
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
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

/**
 * Load data for rendering content below the fold.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context, params}) {
  const relatedProducts = context.storefront
    .query(RELATED_PRODUCTS_QUERY, {
      variables: {handle: params.handle},
    })
    .catch((error) => {
      console.error('Failed to load related products', error);
      return null;
    });

  return {relatedProducts};
}

/* ═══════════════════════════════════════════
 *  PRODUCT PAGE COMPONENT
 * ═══════════════════════════════════════════ */

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, relatedProducts} = useLoaderData();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const images = product.images.nodes;

  return (
    <div className="bg-bone min-h-screen page-fade-in">
      <div className="max-w-7xl mx-auto section-padding">
        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* LEFT — Image Gallery (55%) */}
          <div className="w-full lg:w-[55%]">
            <ImageGallery images={images} selectedVariant={selectedVariant} />
          </div>

          {/* RIGHT — Product Info (45%, sticky) */}
          <div className="w-full lg:w-[45%]">
            <div className="lg:sticky lg:top-24">
              {/* Title */}
              <h1 className="text-3xl font-bold tracking-tight text-charcoal">
                {title}
              </h1>

              {/* Price */}
              <div className="text-2xl mt-2 text-charcoal">
                <ProductPriceDisplay
                  price={selectedVariant?.price}
                  compareAtPrice={selectedVariant?.compareAtPrice}
                />
              </div>

              {/* Variant Selector */}
              <div className="mt-8">
                <VariantSelector
                  productOptions={productOptions}
                  productHandle={product.handle}
                />
              </div>

              {/* Add to Cart */}
              <div className="mt-8">
                <AddToCartSection selectedVariant={selectedVariant} />
              </div>

              {/* Description */}
              {descriptionHtml && (
                <div
                  className="prose prose-sm text-charcoal/70 mt-8 max-w-none"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              )}

              {/* Collapsible Details */}
              <div className="mt-10 border-t border-charcoal/10">
                <CollapsibleDetail title="Shipping & Returns">
                  <p>
                    Free standard shipping on all orders over $200. Express
                    shipping available at checkout.
                  </p>
                  <p className="mt-2">
                    30-day return policy. Items must be unworn with original tags
                    attached. Final sale items are not eligible for return.
                  </p>
                </CollapsibleDetail>

                <CollapsibleDetail title="Size Guide">
                  <p>
                    This piece features an oversized, relaxed fit. We recommend
                    sizing down if you prefer a more tailored silhouette.
                  </p>
                  <p className="mt-2">
                    Model is 6&apos;1&quot; / 185cm and wears a size M.
                  </p>
                </CollapsibleDetail>

                <CollapsibleDetail title="Care Instructions">
                  <p>Machine wash cold with like colors. Tumble dry low.</p>
                  <p className="mt-2">
                    Do not bleach. Iron on low heat if needed. Do not dry clean.
                  </p>
                </CollapsibleDetail>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      <Suspense fallback={null}>
        <Await resolve={relatedProducts}>
          {(data) => {
            const related = data?.product?.collections?.nodes?.[0]?.products?.nodes?.filter(
              (p) => p.id !== product.id,
            ) ?? [];
            if (related.length === 0) return null;
            return (
              <section className="border-t border-charcoal/10 mt-20 pt-16 pb-8 max-w-7xl mx-auto px-4">
                <h2 className="text-2xl font-bold tracking-tight text-charcoal text-center mb-12">
                  YOU MAY ALSO LIKE
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {related.slice(0, 4).map((relProduct, i) => (
                    <ProductCard
                      key={relProduct.id}
                      product={relProduct}
                      loading={i < 2 ? 'eager' : 'lazy'}
                    />
                  ))}
                </div>
              </section>
            );
          }}
        </Await>
      </Suspense>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  IMAGE GALLERY
 * ═══════════════════════════════════════════ */

function ImageGallery({images, selectedVariant}) {
  const variantImageIndex = images.findIndex(
    (img) => img.id === selectedVariant?.image?.id,
  );
  const [selectedIndex, setSelectedIndex] = useState(
    variantImageIndex >= 0 ? variantImageIndex : 0,
  );

  const mainImage = images[selectedIndex] || selectedVariant?.image;

  return (
    <div>
      {/* Main Image */}
      <div className="aspect-square bg-charcoal/5 overflow-hidden">
        {mainImage && (
          <Image
            alt={mainImage.altText || 'Product image'}
            data={mainImage}
            aspectRatio="1/1"
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Thumbnail Row */}
      {images.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 overflow-hidden transition-all duration-200 ${
                index === selectedIndex
                  ? 'ring-2 ring-charcoal ring-offset-2 ring-offset-bone'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                alt={image.altText || `Product thumbnail ${index + 1}`}
                data={image}
                aspectRatio="1/1"
                sizes="80px"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  VARIANT SELECTOR
 * ═══════════════════════════════════════════ */

function VariantSelector({productOptions, productHandle}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {productOptions.map((option) => {
        if (option.optionValues.length <= 1) return null;

        return (
          <div key={option.name}>
            {/* Option Label */}
            <h4 className="uppercase tracking-wider text-sm font-medium text-charcoal mb-3">
              {option.name}
            </h4>

            {/* Option Values */}
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                } = value;

                const baseClasses =
                  'px-4 py-2.5 text-sm uppercase tracking-wider border transition-all duration-200';

                const stateClasses = !exists
                  ? 'border-charcoal/10 text-charcoal/30 cursor-not-allowed line-through'
                  : !available
                    ? 'border-charcoal/10 text-charcoal/30 cursor-not-allowed line-through opacity-30'
                    : selected
                      ? 'bg-charcoal text-bone border-charcoal'
                      : 'border-charcoal/20 text-charcoal hover:border-charcoal';

                if (isDifferentProduct) {
                  return (
                    <Link
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      className={`${baseClasses} ${stateClasses} inline-flex items-center justify-center`}
                    >
                      {name}
                    </Link>
                  );
                }

                return (
                  <button
                    key={option.name + name}
                    type="button"
                    disabled={!exists}
                    className={`${baseClasses} ${stateClasses}`}
                    onClick={() => {
                      if (!selected) {
                        void navigate(`?${variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        });
                      }
                    }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  ADD TO CART SECTION
 * ═══════════════════════════════════════════ */

function AddToCartSection({selectedVariant}) {
  const {open} = useAside();
  const isAvailable = selectedVariant?.availableForSale;

  const lines = selectedVariant
    ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
    : [];

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher) => {
        const isAdding = fetcher.state !== 'idle';
        return (
          <button
            type="submit"
            disabled={!selectedVariant || !isAvailable || isAdding}
            onClick={() => open('cart')}
            className={`btn-primary w-full text-center ${
              !isAvailable || isAdding
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isAdding
              ? 'ADDING...'
              : isAvailable
                ? 'ADD TO CART'
                : 'SOLD OUT'}
          </button>
        );
      }}
    </CartForm>
  );
}

/* ═══════════════════════════════════════════
 *  COLLAPSIBLE DETAIL
 * ═══════════════════════════════════════════ */

function CollapsibleDetail({title, children}) {
  return (
    <details className="group border-b border-charcoal/10">
      <summary className="flex items-center justify-between cursor-pointer py-5 text-sm uppercase tracking-widest font-medium text-charcoal select-none">
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 transition-transform duration-200 group-open:rotate-180"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </summary>
      <div className="pb-5 text-sm text-charcoal/60 leading-relaxed">
        {children}
      </div>
    </details>
  );
}

/* ═══════════════════════════════════════════
 *  PRICE DISPLAY
 * ═══════════════════════════════════════════ */

function ProductPriceDisplay({price, compareAtPrice}) {
  if (!price) return <span>&nbsp;</span>;

  if (compareAtPrice) {
    return (
      <div className="flex items-center gap-3">
        <Money data={price} />
        <s className="text-lg text-charcoal/40">
          <Money data={compareAtPrice} />
        </s>
      </div>
    );
  }

  return <Money data={price} />;
}

/* ═══════════════════════════════════════════
 *  GRAPHQL QUERIES
 * ═══════════════════════════════════════════ */

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const RELATED_PRODUCTS_QUERY = `#graphql
  query RelatedProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      collections(first: 1) {
        nodes {
          products(first: 5) {
            nodes {
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
              }
            }
          }
        }
      }
    }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
