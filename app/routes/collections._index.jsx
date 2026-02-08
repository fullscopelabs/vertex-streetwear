import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ScrollReveal} from '~/components/ScrollReveal';
import {PageHero} from '~/components/PageHero';

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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
  ]);

  return {collections};
}

/**
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'V☰RTEX | Collections'}];
};

/** Handles that are internal Shopify collections, not real storefront collections */
const HIDDEN_COLLECTION_HANDLES = new Set([
  'frontpage',
  'home-page',
  'all',
]);

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

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  // Filter out internal/non-real collections
  const nodes = (collections?.nodes ?? []).filter(
    (c) => !HIDDEN_COLLECTION_HANDLES.has(c.handle),
  );

  // Pre-compute hero images so each collection gets a UNIQUE product image.
  // Process collections from LAST to FIRST so that smaller collections (which
  // tend to appear later and have fewer image options) claim their image first,
  // and larger collections (with many products) can easily use a different one.
  const heroImageMap = new Map();
  const usedHeroUrls = new Set();

  const reversed = [...nodes].reverse();
  for (const collection of reversed) {
    if (collection?.image) {
      heroImageMap.set(collection.id, collection.image);
      if (collection.image.url) usedHeroUrls.add(collection.image.url);
      continue;
    }

    const allProducts = collection.products?.nodes ?? [];

    // Try to find a product image not yet used by another collection
    const unique =
      allProducts.find(
        (p) => p.featuredImage && !usedHeroUrls.has(p.featuredImage.url),
      )?.featuredImage ?? null;

    // If everything is taken, fall back to any available image
    const heroImage =
      unique ?? allProducts.find((p) => p.featuredImage)?.featuredImage ?? null;

    if (heroImage?.url) usedHeroUrls.add(heroImage.url);
    heroImageMap.set(collection.id, heroImage);
  }

  return (
    <div className="min-h-screen page-fade-in texture-canvas">
      <PageHero title="Collections" subtitle="Explore Our Range" />

      {/* Table-of-contents index strip */}
      {nodes.length > 0 && <CollectionIndex collections={nodes} />}

      {/* Editorial sections — each collection gets its own layout */}
      <div>
        {nodes.map((collection, index) => (
          <CollectionEditorialSection
            key={collection.id}
            collection={collection}
            index={index}
            reverse={index % 2 !== 0}
            heroImage={heroImageMap.get(collection.id)}
            allHeroUrls={usedHeroUrls}
          />
        ))}
      </div>

      {/* Pagination */}
      {collections.pageInfo?.hasNextPage && (
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <PaginatedResourceSection
              connection={collections}
              resourcesClassName="hidden"
            >
              {({node}) => null}
            </PaginatedResourceSection>
          </div>
        </section>
      )}

      {/* CTA Band */}
      <section className="bg-gradient-to-br from-charcoal via-tobacco to-forest grain dark-accent-border">
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-14 md:py-20 text-center">
          <ScrollReveal>
            <p className="text-[10px] tracking-[0.35em] uppercase text-sand/50 mb-4">
              Don&apos;t Know Where to Start?
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light tracking-tight text-bone mb-6">
              Browse Everything
            </h2>
            <div className="divider-lux mx-auto mb-10" />
            <p className="text-bone/50 text-sm leading-relaxed max-w-md mx-auto mb-12">
              View our full catalog of streetwear essentials — every piece,
              every collection, in one place.
            </p>
            <Link
              to="/collections/all"
              className="inline-block border border-sand/30 text-sand px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-sand hover:text-charcoal transition-all duration-500"
            >
              Shop All Products
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════
 *  TABLE-OF-CONTENTS INDEX STRIP
 *  A clean horizontal navigation showing all collection names,
 *  styled like a magazine table of contents.
 * ═══════════════════════════════════════════ */
function CollectionIndex({collections}) {
  return (
    <section className="border-b border-charcoal/8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ScrollReveal>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 justify-center">
            {collections.map((collection, i) => (
              <Link
                key={collection.id}
                to={`/collections/${collection.handle}`}
                prefetch="intent"
                className="group inline-flex items-baseline gap-2 text-charcoal/40 hover:text-charcoal transition-colors duration-300"
              >
                <span className="font-serif text-[11px] text-charcoal/25 group-hover:text-rust transition-colors duration-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xs uppercase tracking-[0.15em] font-medium">
                  {collection.title}
                </span>
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  EDITORIAL SECTION
 *  Each collection rendered as a full-width split section.
 *  Alternates image left/right for visual rhythm.
 *  Text and image are SEPARATED — no overlays.
 * ═══════════════════════════════════════════ */

/**
 * @param {{
 *   collection: CollectionWithProducts;
 *   index: number;
 *   reverse: boolean;
 *   heroImage: object | null;
 *   allHeroUrls: Set<string>;
 * }}
 */
function CollectionEditorialSection({collection, index, reverse, heroImage, allHeroUrls}) {
  const indexLabel = String(index + 1).padStart(2, '0');
  const allProducts = collection.products?.nodes ?? [];

  // Thumbnails: skip products whose images are used as hero in ANY collection
  // (prevents the same product image appearing as both a thumbnail here and
  // a hero in another collection section)
  const thumbnailProducts = allProducts
    .filter((p) => p.featuredImage && !allHeroUrls.has(p.featuredImage.url))
    .slice(0, 3);

  return (
    <section className="border-b border-charcoal/8 last:border-b-0">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div
            className={`flex flex-col ${
              reverse ? 'md:flex-row-reverse' : 'md:flex-row'
            } min-h-[500px] lg:min-h-[600px]`}
          >
            {/* ── IMAGE SIDE (55%) ── */}
            <div className="w-full md:w-[55%] relative">
              <Link
                to={`/collections/${collection.handle}`}
                prefetch="intent"
                className="group block relative overflow-hidden h-full"
              >
                {heroImage ? (
                  <Image
                    alt={heroImage.altText || collection.title}
                    data={heroImage}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="w-full h-full object-cover min-h-[350px] md:min-h-full group-hover:scale-[1.03] transition-transform duration-[1200ms] ease-out"
                  />
                ) : (
                  <div className="w-full h-full min-h-[350px] md:min-h-full bg-gradient-to-br from-charcoal/5 to-charcoal/10 flex items-center justify-center">
                    <span className="font-serif text-7xl text-charcoal/8 select-none">
                      {indexLabel}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* ── TEXT SIDE (45%) ── */}
            <div className="w-full md:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 md:py-16">
              {/* Index number — large decorative element */}
              <span className="font-serif text-7xl lg:text-8xl font-light text-charcoal/[0.06] leading-none select-none mb-4 md:mb-6">
                {indexLabel}
              </span>

              {/* Collection name */}
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-charcoal leading-tight">
                {collection.title}
              </h2>

              {/* Definition accent */}
              <p className="font-serif italic text-sm text-charcoal/40 mt-2 tracking-wide">
                /{collection.title.toLowerCase()}/
              </p>
              <p className="text-charcoal/35 text-xs mt-1 italic">
                {getCollectionDefinition(collection.handle)}
              </p>

              {/* Rust accent */}
              <div className="w-10 h-px bg-rust mt-5 mb-5" />

              {/* Description */}
              {collection.description && (
                <p className="text-charcoal/50 text-sm leading-relaxed max-w-sm mb-6">
                  {collection.description}
                </p>
              )}

              {/* Product thumbnails preview — shows what's inside */}
              {thumbnailProducts.length > 0 && (
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/30 mb-3 font-medium">
                    Inside this collection
                  </p>
                  <div className="flex gap-3">
                    {thumbnailProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.handle}`}
                        prefetch="intent"
                        className="group/thumb block w-16 h-20 bg-charcoal/5 overflow-hidden flex-shrink-0"
                      >
                        {product.featuredImage && (
                          <Image
                            alt={
                              product.featuredImage.altText || product.title
                            }
                            data={product.featuredImage}
                            loading="lazy"
                            sizes="64px"
                            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link
                to={`/collections/${collection.handle}`}
                prefetch="intent"
                className="group/cta inline-flex items-center gap-3 self-start"
              >
                <span className="text-xs uppercase tracking-[0.15em] font-semibold text-charcoal group-hover/cta:text-rust transition-colors duration-300">
                  Explore Collection
                </span>
                <span className="w-8 h-px bg-charcoal/30 group-hover/cta:w-12 group-hover/cta:bg-rust transition-all duration-300" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
 *  GRAPHQL
 *  Fetches collections with description + first 3 product
 *  thumbnails for the inline preview.
 * ═══════════════════════════════════════════ */
const COLLECTIONS_QUERY = `#graphql
  fragment CollectionWithProducts on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 6) {
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
      }
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...CollectionWithProducts
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/**
 * @typedef {{
 *   id: string;
 *   title: string;
 *   handle: string;
 *   description?: string;
 *   image?: { id: string; url: string; altText?: string; width: number; height: number } | null;
 *   products: { nodes: Array<{ id: string; title: string; handle: string; featuredImage?: { id: string; url: string; altText?: string; width: number; height: number } | null }> };
 * }} CollectionWithProducts
 */

/** @typedef {import('./+types/collections._index').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
