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

  return (
    <Link
      to={`/products/${product.handle}`}
      prefetch="intent"
      className="group block"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-charcoal/5 overflow-hidden mb-4">
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 768px) 25vw, 50vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      </div>

      {/* Product Info */}
      <h3 className="font-medium text-sm uppercase tracking-wider text-charcoal">
        {product.title}
      </h3>
      <p className="text-charcoal/70 text-sm mt-1">
        <Money data={product.priceRange.minVariantPrice} />
      </p>
    </Link>
  );
}
