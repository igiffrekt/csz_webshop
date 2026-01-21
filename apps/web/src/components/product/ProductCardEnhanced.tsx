'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, getStrapiMediaUrl } from '@/lib/formatters';
import { useCartStore } from '@/stores/cart';
import type { Product } from '@csz/types';
import { toast } from 'sonner';

interface ProductCardEnhancedProps {
  product: Product;
  showRating?: boolean;
  showQuickActions?: boolean;
}

export function ProductCardEnhanced({
  product,
  showRating = true,
  showQuickActions = true,
}: ProductCardEnhancedProps) {
  const addItem = useCartStore((state) => state.addItem);

  const imageUrl = product.images?.[0]
    ? getStrapiMediaUrl(product.images[0].url)
    : null;

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = isOnSale
    ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100)
    : 0;

  // Get primary category
  const category = product.categories?.[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    addItem(product, undefined, 1);
    toast.success('Termék hozzáadva a kosárhoz');
  };

  return (
    <div className="group relative bg-white rounded-xl border border-secondary-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image container */}
      <Link href={`/termekek/${product.slug}`} className="block relative aspect-square overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-secondary-100 flex items-center justify-center">
            <span className="text-5xl">🧯</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOnSale && (
            <span className="bg-danger text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
              Kiemelt
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-secondary-600 text-white text-xs font-medium px-2 py-1 rounded">
              Elfogyott
            </span>
          )}
        </div>

        {/* Quick actions */}
        {showQuickActions && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info('Kedvencek funkció hamarosan!');
              }}
              title="Kedvencekhez"
            >
              <Heart className="h-4 w-4" />
            </button>
            <Link
              href={`/termekek/${product.slug}`}
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
              title="Megtekintés"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <Link
            href={`/kategoriak/${category.slug}`}
            className="text-xs text-secondary-500 hover:text-primary-500 transition-colors"
          >
            {category.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/termekek/${product.slug}`}>
          <h3 className="font-semibold text-secondary-900 mt-1 line-clamp-2 group-hover:text-primary-500 transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-3.5 w-3.5',
                    star <= 4 ? 'text-primary-500 fill-primary-500' : 'text-secondary-300'
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-secondary-500">(4.0)</span>
          </div>
        )}

        {/* Price and cart */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-secondary-900">
              {formatPrice(product.basePrice)}
            </span>
            {isOnSale && (
              <span className="text-sm text-secondary-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              product.stock <= 0
                ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
            title={product.stock <= 0 ? 'Elfogyott' : 'Kosárba'}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
