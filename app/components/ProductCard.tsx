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
      {/* Image Container */}
      <div className="relative aspect-square bg-charcoal/5 overflow-hidden mb-4">
        {/* Skeleton loader */}
        {image && !imageLoaded && (
          <div className="absolute inset-0 bg-charcoal/10 animate-pulse" />
        )}

        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 768px) 25vw, 50vw"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />

        {/* Quick View text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-bone/90 text-charcoal text-xs uppercase tracking-widest px-4 py-2 backdrop-blur-sm">
            Quick View
          </span>
        </div>

        {/* Rust accent bar on hover */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-rust scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>

      {/* Product Info */}
      <h3 className="font-semibold text-sm uppercase tracking-wider text-charcoal">
        {product.title}
      </h3>
      <p className="text-charcoal-light text-sm mt-1 tracking-wide">
        <Money data={product.priceRange.minVariantPrice} />
      </p>
    </Link>
  );
}
