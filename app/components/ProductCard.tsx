import {useState} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

interface ProductCardProps {
  product: {
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
  };
  loading?: 'eager' | 'lazy';
}

export function ProductCard({product, loading}: ProductCardProps) {
  const image = product.featuredImage;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group block"
    >
      {/* Image Container — portrait 3:4 ratio for fashion */}
      <div className="relative aspect-[3/4] bg-charcoal/[0.03] overflow-hidden">
        {/* Skeleton loader */}
        {image && !imageLoaded && (
          <div className="absolute inset-0 bg-charcoal/[0.06] animate-pulse" />
        )}

        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="3/4"
            data={image}
            loading={loading}
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}

        {/* Hover vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* "View" indicator on hover */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out">
          <span className="text-[10px] uppercase tracking-[0.3em] text-bone font-medium">
            View
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="pt-4 pb-1">
        <h3 className="text-[12px] uppercase tracking-[0.12em] font-medium text-charcoal leading-normal group-hover:text-charcoal/60 transition-colors duration-300">
          {product.title}
        </h3>
        <p className="text-[11px] tracking-[0.08em] text-charcoal/40 mt-1 tabular-nums">
          <Money data={product.priceRange.minVariantPrice} />
        </p>
      </div>
    </Link>
  );
}
