'use client';

import { useState, useEffect } from 'react';
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
  showCountdown?: boolean;
}

// Mini countdown timer component
function MiniCountdown({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-1">
      <TimeBox value={timeLeft.days} label="N" />
      <TimeBox value={timeLeft.hours} label="Ó" />
      <TimeBox value={timeLeft.minutes} label="P" />
      <TimeBox value={timeLeft.seconds} label="M" />
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-gray-900 text-white text-center rounded px-1.5 py-1 min-w-[28px]">
      <div className="text-xs font-bold leading-none">{value.toString().padStart(2, '0')}</div>
      <div className="text-[8px] text-gray-400 leading-none mt-0.5">{label}</div>
    </div>
  );
}

export function ProductCardEnhanced({
  product,
  showRating = true,
  showQuickActions = true,
  showCountdown = false,
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

  // Calculate a random end date for the countdown (for demo purposes)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    addItem(product, undefined, 1);
    toast.success('Termék hozzáadva a kosárhoz');
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Image container */}
      <Link href={`/termekek/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">🧯</span>
          </div>
        )}

        {/* Discount badge - yellow like reference */}
        {isOnSale && (
          <div className="absolute top-3 left-3">
            <span className="bg-amber-400 text-gray-900 text-xs font-bold px-2.5 py-1 rounded">
              {discountPercent}% off
            </span>
          </div>
        )}

        {/* Featured badge */}
        {product.isFeatured && !isOnSale && (
          <div className="absolute top-3 left-3">
            <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded">
              Kiemelt
            </span>
          </div>
        )}

        {/* Out of stock badge */}
        {product.stock <= 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-gray-600 text-white text-xs font-medium px-2.5 py-1 rounded">
              Elfogyott
            </span>
          </div>
        )}

        {/* Quick actions */}
        {showQuickActions && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <button
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-amber-400 hover:text-gray-900 transition-colors"
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
              className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-amber-400 hover:text-gray-900 transition-colors"
              title="Megtekintés"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Countdown timer - shown for sale items */}
        {(showCountdown || isOnSale) && (
          <div className="absolute bottom-3 left-3 right-3">
            <MiniCountdown endDate={endDate} />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <Link
            href={`/kategoriak/${category.slug}`}
            className="text-xs text-gray-500 hover:text-amber-600 transition-colors"
          >
            {category.name}
          </Link>
        )}

        {/* Rating */}
        {showRating && (
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-medium text-gray-900">4.{Math.floor(Math.random() * 10)}</span>
          </div>
        )}

        {/* Title */}
        <Link href={`/termekek/${product.slug}`}>
          <h3 className="font-medium text-gray-900 mt-2 line-clamp-2 group-hover:text-amber-600 transition-colors min-h-[2.5rem] text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="font-bold text-lg text-gray-900">
            {formatPrice(product.basePrice)}
          </span>
          {isOnSale && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Add to cart button - full width yellow */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={cn(
            'w-full mt-3 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors',
            product.stock <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-amber-400 text-gray-900 hover:bg-amber-500'
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock <= 0 ? 'Elfogyott' : 'Kosárba'}
        </button>
      </div>
    </div>
  );
}
