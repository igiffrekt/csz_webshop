'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Star, ArrowRight, ShoppingCart } from 'lucide-react';
import { formatPrice, getStrapiMediaUrl } from '@/lib/formatters';
import { cn } from '@/lib/utils';
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

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
          <div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full mb-3">
              Napi ajánlatok
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Mai Akciók
            </h2>
          </div>

          <p className="text-gray-600 max-w-md lg:text-right">
            Fedezze fel különleges napi ajánlatainkat! Korlátozott ideig elérhető kedvezmények a legjobb tűzvédelmi termékekre.
          </p>
        </div>

        {/* Deals grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {dealProducts.map((product, index) => (
            <DealCard
              key={product.documentId}
              product={product}
              variant={index === 0 ? 'primary' : 'secondary'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface DealCardProps {
  product: Product;
  variant?: 'primary' | 'secondary';
}

function DealCard({ product, variant = 'primary' }: DealCardProps) {
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

  const bgColor = variant === 'primary' ? 'bg-amber-50' : 'bg-gray-50';

  return (
    <div className={`relative ${bgColor} rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row gap-6 group overflow-hidden`}>
      {/* Discount badge - circular */}
      <div className="absolute top-4 left-4 z-10">
        <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-sm font-bold">{discountPercent}%</span>
        </div>
      </div>

      {/* Image - circular container */}
      <div className="relative w-full sm:w-2/5 aspect-square flex-shrink-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-[200px] mx-auto">
          <Link href={`/termekek/${product.slug}`} className="block h-full">
            <div className="w-full h-full rounded-full bg-white shadow-inner flex items-center justify-center p-4 overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <span className="text-6xl">🧯</span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Category */}
        {category && (
          <span className="text-sm text-gray-500">{category.name}</span>
        )}

        {/* Title */}
        <Link href={`/termekek/${product.slug}`}>
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mt-1 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(product.basePrice)}
          </span>
          {isOnSale && (
            <span className="text-base text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-3">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-medium text-gray-900">5.0</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">
          {product.shortDescription || 'Professzionális minőségű termék, CE tanúsítvánnyal. Megbízható tűzvédelem minden környezetben.'}
        </p>

        {/* Shop Now link */}
        <Link
          href={`/termekek/${product.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors mt-4"
        >
          Vásárlás
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
