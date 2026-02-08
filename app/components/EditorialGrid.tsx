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
        <div className="grid grid-cols-2 gap-8 md:gap-10 max-w-5xl mx-auto place-items-start">
          {featureProducts.map((product, index) => (
            <ScrollReveal 
              key={product.id} 
              delay={index * 100}
              className={featureProducts.length === 1 ? 'col-start-1 col-span-1 justify-self-center' : ''}
            >
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
 * Grid that centers incomplete last rows independently for mobile and desktop.
 * Mobile: 2 columns
 * Desktop: 3 columns
 * Both center incomplete last rows when there are rows above them.
 */
function GridSection({
  products,
  startIndex,
}: {
  products: Product[];
  startIndex: number;
}) {
  // Mobile: 2 columns - check for single orphan
  const remainderMobile = products.length % 2;
  const hasMobileOrphan = remainderMobile === 1 && products.length >= 3;
  
  // Desktop: 3 columns - check for 1-2 orphans
  const remainderDesktop = products.length % 3;
  const hasDesktopOrphans = remainderDesktop > 0 && products.length >= 4;
  
  // Calculate products for main grid vs orphans
  // Use desktop logic as base since it's more restrictive
  const orphanCountDesktop = hasDesktopOrphans ? remainderDesktop : 0;
  
  let fullGridProducts = products;
  let mobileOrphanProducts = [];
  let desktopOrphanProducts = [];
  
  if (orphanCountDesktop > 0) {
    // Desktop has orphans - separate them
    fullGridProducts = products.slice(0, -orphanCountDesktop);
    desktopOrphanProducts = products.slice(-orphanCountDesktop);
    
    // Check if these desktop orphans also need centering on mobile
    const remainingForMobile = desktopOrphanProducts.length % 2;
    if (remainingForMobile === 1) {
      // Desktop orphans have 1 odd item, center it on mobile too
      mobileOrphanProducts = desktopOrphanProducts.slice(-1);
    } else {
      // Desktop orphans are even (2 items), they'll fill mobile row naturally
      mobileOrphanProducts = [];
    }
  } else if (hasMobileOrphan) {
    // No desktop orphans, but mobile has one
    fullGridProducts = products.slice(0, -1);
    mobileOrphanProducts = products.slice(-1);
  }

  return (
    <div>
      {/* Main grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {fullGridProducts.map((product, index) => (
          <ScrollReveal key={product.id} delay={(index % 3) * 80}>
            <ProductCard
              product={product}
              loading={startIndex + index < 8 ? 'eager' : 'lazy'}
            />
          </ScrollReveal>
        ))}
        
        {/* Desktop orphans that fit evenly in mobile grid */}
        {desktopOrphanProducts.length === 2 && (
          desktopOrphanProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={80} className="md:hidden">
              <ProductCard
                product={product}
                loading="lazy"
              />
            </ScrollReveal>
          ))
        )}
      </div>

      {/* Mobile: Center single orphan (from mobile or desktop orphans) */}
      {mobileOrphanProducts.length > 0 && (
        <div className="flex justify-center gap-6 mt-6 md:hidden">
          <div style={{width: 'calc((100% - 1.5rem) / 2)'}}>
            <ScrollReveal delay={0}>
              <ProductCard
                product={mobileOrphanProducts[0]}
                loading="lazy"
              />
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* Desktop: Center orphans */}
      {desktopOrphanProducts.length > 0 && (
        <div className="hidden md:flex md:justify-center md:gap-8 mt-8">
          {desktopOrphanProducts.map((product, index) => (
            <div 
              key={product.id} 
              style={{width: 'calc((100% - 4rem) / 3)'}}
            >
              <ScrollReveal delay={(index % 3) * 80}>
                <ProductCard
                  product={product}
                  loading="lazy"
                />
              </ScrollReveal>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
