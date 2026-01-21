'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Star, ArrowRight, ShoppingCart } from 'lucide-react';
import { formatPrice, getStrapiMediaUrl } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { useCartStore } from '@/stores/cart';
import { toast } from 'sonner';
import type { Product } from '@csz/types';

interface DealsSectionProps {
  products: Product[];
}

export function DealsSection({ products }: DealsSectionProps) {
  // Get products on sale or first 2 products
  let dealProducts = products
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.basePrice)
    .slice(0, 2);

  if (dealProducts.length < 2) {
    // Fill with first products as fallback
    const remaining = products
      .filter((p) => !dealProducts.find((d) => d.documentId === p.documentId))
      .slice(0, 2 - dealProducts.length);
    dealProducts = [...dealProducts, ...remaining];
  }

  if (dealProducts.length === 0) {
    return null;
  }

  // End date for countdown (end of current day)
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full mb-3">
              Napi ajánlatok
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900">
              Mai Akciók
            </h2>
            <p className="text-secondary-600 mt-2">
              Korlátozott ideig érvényes ajánlatok
            </p>
          </div>

          <CountdownTimer endDate={endOfDay} />
        </div>

        {/* Deals grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {dealProducts.map((product) => (
            <DealCard key={product.documentId} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DealCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const imageUrl = product.images?.[0]
    ? getStrapiMediaUrl(product.images[0].url)
    : null;

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = isOnSale
    ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100)
    : 20;

  const category = product.categories?.[0];

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addItem(product, undefined, 1);
    toast.success('Termék hozzáadva a kosárhoz');
  };

  return (
    <div className="relative bg-secondary-50 rounded-2xl p-6 flex flex-col md:flex-row gap-6 group overflow-hidden">
      {/* Discount badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-block px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
          -{discountPercent}%
        </span>
      </div>

      {/* Image */}
      <div className="relative w-full md:w-2/5 aspect-square flex-shrink-0">
        <Link href={`/termekek/${product.slug}`} className="block h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-secondary-200 rounded-xl flex items-center justify-center">
              <span className="text-6xl">🧯</span>
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Category */}
        {category && (
          <span className="text-sm text-secondary-500">{category.name}</span>
        )}

        {/* Title */}
        <Link href={`/termekek/${product.slug}`}>
          <h3 className="text-xl lg:text-2xl font-bold text-secondary-900 mt-1 group-hover:text-primary-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-4 w-4',
                  star <= 4 ? 'text-primary-500 fill-primary-500' : 'text-secondary-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-secondary-500 ml-1">(4.8)</span>
        </div>

        {/* Description */}
        {product.shortDescription && (
          <p className="text-secondary-600 text-sm mt-3 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-2xl lg:text-3xl font-bold text-secondary-900">
            {formatPrice(product.basePrice)}
          </span>
          {isOnSale && (
            <span className="text-lg text-secondary-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors',
              product.stock <= 0
                ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
          >
            <ShoppingCart className="h-5 w-5" />
            Kosárba
          </button>
          <Link
            href={`/termekek/${product.slug}`}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-secondary-300 text-secondary-700 hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            Részletek
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
