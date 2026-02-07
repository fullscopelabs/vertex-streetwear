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
      <div className="relative aspect-[3/4] bg-charcoal/5 overflow-hidden mb-4">
        {/* Skeleton loader */}
        {image && !imageLoaded && (
          <div className="absolute inset-0 bg-charcoal/10 animate-pulse" />
        )}

        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="3/4"
            data={image}
            loading={loading}
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}

        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors duration-500" />
      </div>

      {/* Product Info */}
      <h3 className="font-normal text-sm tracking-wide text-charcoal group-hover:text-rust transition-colors duration-300">
        {product.title}
      </h3>
      <p className="text-charcoal-light text-sm mt-1 tabular-nums">
        <Money data={product.priceRange.minVariantPrice} />
      </p>
    </Link>
  );
}
