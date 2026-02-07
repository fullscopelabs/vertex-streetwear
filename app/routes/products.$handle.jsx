import {Suspense, useState} from 'react';
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
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductCard} from '~/components/ProductCard';
import {ScrollReveal} from '~/components/ScrollReveal';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const title = data?.product?.title ?? 'Product';
  return [
    {title: `${title} | V☰RTEX`},
    {
      name: 'description',
      content:
        data?.product?.description ??
        `Shop ${title} at V☰RTEX — premium streetwear essentials.`,
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
    <div className="min-h-screen page-fade-in">
      {/* Hero gradient background */}
      <div className="bg-gradient-to-b from-bone-dark via-bone to-bone">
        <div className="max-w-[1400px] mx-auto py-12 md:py-16 px-4">
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* LEFT — Image Gallery (55%) */}
            <div className="w-full lg:w-[55%]">
              <ImageGallery images={images} selectedVariant={selectedVariant} />
            </div>

            {/* RIGHT — Product Info (45%, sticky) */}
            <div className="w-full lg:w-[45%]">
              <div className="lg:sticky lg:top-24">
                {/* Premium info card */}
                <div className="bg-bone-dark/40 backdrop-blur-sm border border-charcoal/8 p-8 md:p-10">
                  {/* Title */}
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-charcoal leading-tight">
                    {title}
                  </h1>

                  {/* Accent divider */}
                  <div className="divider-lux mt-6 mb-6" />

                  {/* Price */}
                  <div className="text-2xl md:text-3xl text-charcoal font-light">
                    <ProductPriceDisplay
                      price={selectedVariant?.price}
                      compareAtPrice={selectedVariant?.compareAtPrice}
                    />
                  </div>

                  {/* Variant Selector */}
                  <div className="mt-8 pt-8 border-t border-charcoal/10">
                    <VariantSelector
                      productOptions={productOptions}
                    />
                  </div>

                  {/* Add to Cart */}
                  <div className="mt-8">
                    <AddToCartSection selectedVariant={selectedVariant} />
                  </div>

                  {/* Description */}
                  {descriptionHtml && (
                    <>
                      <div className="divider-sand mt-10 mb-8" />
                      <div
                        className="prose prose-sm text-charcoal/70 max-w-none leading-relaxed"
                        dangerouslySetInnerHTML={{__html: descriptionHtml}}
                      />
                    </>
                  )}

                  {/* Collapsible Details */}
                  <div className="mt-8 pt-8 border-t border-charcoal/10">
                    <CollapsibleDetail title="Shipping & Returns">
                      <p className="text-sm text-charcoal/70 leading-relaxed">
                        Free standard shipping on all orders over $200. Express
                        shipping available at checkout.
                      </p>
                      <p className="mt-3 text-sm text-charcoal/70 leading-relaxed">
                        30-day return policy. Items must be unworn with original tags
                        attached. Final sale items are not eligible for return.
                      </p>
                    </CollapsibleDetail>

                    <CollapsibleDetail title="Size Guide">
                      <p className="text-sm text-charcoal/70 leading-relaxed">
                        This piece features an oversized, relaxed fit. We recommend
                        sizing down if you prefer a more tailored silhouette.
                      </p>
                      <p className="mt-3 text-sm text-charcoal/70 leading-relaxed">
                        Model is 6&apos;1&quot; / 185cm and wears a size M.
                      </p>
                    </CollapsibleDetail>

                    <CollapsibleDetail title="Care Instructions">
                      <p className="text-sm text-charcoal/70 leading-relaxed">
                        Machine wash cold with like colors. Tumble dry low.
                      </p>
                      <p className="mt-3 text-sm text-charcoal/70 leading-relaxed">
                        Do not bleach. Iron on low heat if needed. Do not dry clean.
                      </p>
                    </CollapsibleDetail>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like - Dark Premium Section */}
      <Suspense fallback={null}>
        <Await resolve={relatedProducts}>
          {(data) => {
            const related = data?.product?.collections?.nodes?.[0]?.products?.nodes?.filter(
              (p) => p.id !== product.id,
            ) ?? [];
            if (related.length === 0) return null;
            return (
              <section className="relative bg-gradient-to-b from-charcoal to-charcoal/95 dark-accent-border grain py-16 md:py-20">
                <div className="relative z-10 max-w-7xl mx-auto px-4">
                  <ScrollReveal>
                    <div className="text-center mb-12 md:mb-16">
                      <div className="divider-sand max-w-xs mx-auto mb-8" />
                      <h2 className="font-serif text-2xl md:text-3xl text-bone font-light tracking-wide mb-3">
                        You May Also Like
                      </h2>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-sand/60">
                        Curated for Your Style
                      </p>
                    </div>
                  </ScrollReveal>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {related.slice(0, 4).map((relProduct, i) => (
                      <ScrollReveal key={relProduct.id} delay={i * 100}>
                        <div className="bg-bone-dark/90 backdrop-blur-sm border border-sand/20 p-4 hover:border-sand/40 transition-all duration-300">
                          <ProductCard
                            product={relProduct}
                            loading={i < 2 ? 'eager' : 'lazy'}
                          />
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
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
  const allImages =
    images.length > 0 ? images : selectedVariant?.image ? [selectedVariant.image] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(0); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < allImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  return (
    <>
      {/* MOBILE: Swipeable Carousel */}
      <div className="lg:hidden">
        <div className="relative bg-charcoal/5 overflow-hidden">
          {/* Image Container */}
          <div
            className="relative aspect-[3/4]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {allImages.map((image, index) => (
              <div
                key={image.id || index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Image
                  alt={image.altText || `Product image ${index + 1}`}
                  data={image}
                  aspectRatio="3/4"
                  sizes="100vw"
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 bg-bone/90 text-charcoal p-2 rounded-full shadow-lg hover:bg-bone transition-all duration-300 z-10"
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 bg-bone/90 text-charcoal p-2 rounded-full shadow-lg hover:bg-bone transition-all duration-300 z-10"
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-charcoal/80 backdrop-blur-sm text-bone px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider">
            {currentIndex + 1} / {allImages.length}
          </div>
        </div>

        {/* Dot Navigation */}
        {allImages.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {allImages.map((image, index) => (
              <button
                key={image.id || `dot-${index}`}
                onClick={() => goToSlide(index)}
                className={`cursor-pointer transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-6 h-1.5 bg-charcoal'
                    : 'w-1.5 h-1.5 bg-charcoal/20 hover:bg-charcoal/40'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP: Main Image + Thumbnail Gallery */}
      <div className="hidden lg:block">
        <div className="space-y-4">
          {/* Main Image Display */}
          <div className="bg-charcoal/5 overflow-hidden relative group">
            <div className="aspect-[3/4]">
              {allImages[currentIndex] && (
                <Image
                  alt={allImages[currentIndex].altText || `Product image ${currentIndex + 1}`}
                  data={allImages[currentIndex]}
                  aspectRatio="3/4"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="w-full h-full object-cover"
                  loading={currentIndex === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>

            {/* Navigation Arrows (shown on hover) */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 bg-bone/90 text-charcoal p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 hover:bg-bone transition-all duration-300 z-10"
                  aria-label="Previous image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 bg-bone/90 text-charcoal p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 hover:bg-bone transition-all duration-300 z-10"
                  aria-label="Next image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter (bottom right) */}
            <div className="absolute bottom-4 right-4 bg-charcoal/80 backdrop-blur-sm text-bone px-3 py-1.5 rounded text-[10px] font-medium tracking-wider">
              {currentIndex + 1} / {allImages.length}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={image.id || index}
                  onClick={() => goToSlide(index)}
                  className={`cursor-pointer relative aspect-[3/4] bg-charcoal/5 overflow-hidden transition-all duration-300 ${
                    index === currentIndex
                      ? 'ring-2 ring-charcoal ring-offset-2 ring-offset-bone'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    alt={image.altText || `Thumbnail ${index + 1}`}
                    data={image}
                    aspectRatio="3/4"
                    sizes="200px"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
 *  VARIANT SELECTOR
 * ═══════════════════════════════════════════ */

function VariantSelector({productOptions}) {
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
                      ? 'bg-charcoal text-bone border-charcoal cursor-pointer'
                      : 'border-charcoal/20 text-charcoal hover:border-charcoal cursor-pointer';

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
