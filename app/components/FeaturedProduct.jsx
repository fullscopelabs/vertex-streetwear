import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {ScrollReveal} from '~/components/ScrollReveal';

/**
 * Editorial hero for a featured product — large image on the left with
 * product details on the right against a dark background.
 *
 * @param {{
 *   product: {
 *     handle: string;
 *     title: string;
 *     featuredImage?: { id?: string; url: string; altText?: string | null; width?: number; height?: number } | null;
 *     priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
 *   };
 * }} props
 */
export function FeaturedProduct({product}) {
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
            <div className="divider-lux mt-5 mb-5" />
            <p className="text-[11px] uppercase tracking-[0.15em] text-bone/50">
              <Money data={product.priceRange.minVariantPrice} />
            </p>
            <div className="mt-8">
              <Link
                to={`/products/${product.handle}`}
                prefetch="intent"
                className="inline-block border border-sand/30 text-sand px-8 py-4 text-[11px] font-medium uppercase tracking-[0.18em] hover:bg-sand/10 transition-all duration-300"
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
