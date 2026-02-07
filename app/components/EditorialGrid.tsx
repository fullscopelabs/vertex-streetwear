import {ProductCard} from '~/components/ProductCard';
import {ScrollReveal} from '~/components/ScrollReveal';

interface Product {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  featuredImage?: {
    id?: string;
    url: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
}

interface EditorialGridProps {
  products: Product[];
  sectionLabel?: string;
}

/**
 * Editorial product grid with a curated hierarchy:
 *
 *   ┌────────────┬────────────┐
 *   │  Feature 1 │  Feature 2 │   ← 2-column "curated picks" row
 *   └────────────┴────────────┘
 *   ────────── divider ──────────
 *   ┌────────┬────────┬────────┐
 *   │   3    │   4    │   5    │   ← consistent 3-column grid
 *   ├────────┼────────┼────────┤
 *   │   6    │   7    │   …    │
 *   └────────┴────────┴────────┘
 *
 * Orphan items (1 or 2 in a 3-col row) are centered via
 * justify-items so they don't hug the left edge.
 */
export function EditorialGrid({products, sectionLabel}: EditorialGridProps) {
  if (!products || products.length === 0) return null;

  // Feature row: first 2 products (or 1 if only 1 remaining)
  const featureProducts = products.slice(0, Math.min(2, products.length));
  // Standard grid: everything after the first 2
  const gridProducts = products.slice(featureProducts.length);

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {sectionLabel && (
          <ScrollReveal className="mb-14">
            <p className="text-[10px] uppercase tracking-[0.35em] text-charcoal/40 text-center">
              {sectionLabel}
            </p>
          </ScrollReveal>
        )}

        {/* Feature row — 2 large cards */}
        <div
          className={`grid gap-8 md:gap-10 max-w-5xl mx-auto ${
            featureProducts.length === 1
              ? 'grid-cols-1 max-w-lg'
              : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {featureProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 100}>
              <ProductCard
                product={product}
                loading="eager"
              />
            </ScrollReveal>
          ))}
        </div>

        {/* Divider between feature and standard grid */}
        {gridProducts.length > 0 && (
          <div className="divider-sand max-w-xs mx-auto my-14 md:my-20" />
        )}

        {/* Standard 3-column grid */}
        {gridProducts.length > 0 && (
          <GridSection products={gridProducts} startIndex={featureProducts.length} />
        )}
      </div>
    </section>
  );
}

/**
 * 3-column grid that centers orphan items in the last row.
 */
function GridSection({
  products,
  startIndex,
}: {
  products: Product[];
  startIndex: number;
}) {
  const remainder = products.length % 3;
  const fullGridProducts = remainder === 0 ? products : products.slice(0, -remainder);
  const orphanProducts = remainder === 0 ? [] : products.slice(-remainder);

  return (
    <div>
      {/* Full rows */}
      {fullGridProducts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {fullGridProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={(index % 3) * 80}>
              <ProductCard
                product={product}
                loading={startIndex + index < 8 ? 'eager' : 'lazy'}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Orphan row — centered */}
      {orphanProducts.length > 0 && (
        <div className={`flex justify-center gap-6 md:gap-8 ${fullGridProducts.length > 0 ? 'mt-6 md:mt-8' : ''}`}>

          {orphanProducts.map((product, index) => (
            <ScrollReveal
              key={product.id}
              delay={index * 80}
              className={
                orphanProducts.length === 1
                  ? 'w-full max-w-sm'
                  : 'w-full max-w-[calc(33.333%-1rem)]'
              }
            >
              <ProductCard
                product={product}
                loading={startIndex + fullGridProducts.length + index < 8 ? 'eager' : 'lazy'}
              />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
