'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, getImageUrl } from '@/lib/formatters';
import type { ProductVariant } from '@csz/types';
import { useCartStore } from '@/stores/cart';
import type { Product } from '@csz/types';
import { toast } from 'sonner';

interface ProductCardEnhancedProps {
  product: Product;
  showRating?: boolean;
  showQuickActions?: boolean;
  showCountdown?: boolean;
  variant?: 'default' | 'collection';
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
    <div className="bg-gray-900 text-white text-center rounded px-1 sm:px-1.5 py-0.5 sm:py-1 min-w-[24px] sm:min-w-[28px]">
      <div className="text-[10px] sm:text-xs font-bold leading-none">{value.toString().padStart(2, '0')}</div>
      <div className="text-[7px] sm:text-[8px] text-gray-400 leading-none mt-0.5">{label}</div>
    </div>
  );
}

export function ProductCardEnhanced({
  product,
  showRating = true,
  showQuickActions = true,
  showCountdown = false,
  variant = 'default',
}: ProductCardEnhancedProps) {
  const isCollection = variant === 'collection';
  const addItem = useCartStore((state) => state.addItem);

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].url) : null;

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = isOnSale
    ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100)
    : 0;

  // Get primary category
  const category = product.categories?.[0];

  // Build product URL - use category slug if available
  const productUrl = category
    ? `/${category.slug}/${product.slug}`
    : `/termekek/${product.slug}`;

  // Calculate a random end date for the countdown (for demo purposes)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem(product, undefined, 1);
    toast.success('Termék hozzáadva a kosárhoz');
  };

  return (
    <div className={cn(
      "group relative bg-transparent overflow-visible transition-all duration-300",
      isCollection && "h-auto sm:h-[500px] flex flex-col"
    )}>
      {/* Image container */}
      <div className={cn(
        "relative overflow-hidden bg-[#f6f6f6] rounded-2xl sm:rounded-[30px]",
        isCollection ? "h-[240px] sm:h-[385px] flex-shrink-0" : "aspect-square"
      )}>
        <Link href={productUrl} className="block w-full h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-2 sm:p-4 transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl">🧯</span>
            </div>
          )}
        </Link>

        {/* Discount badge - yellow like reference */}
        {isOnSale && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 pointer-events-none">
            <span className="bg-[#FFBB36] text-gray-900 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded">
              {discountPercent}% off
            </span>
          </div>
        )}

        {/* Featured badge */}
        {product.isFeatured && !isOnSale && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 pointer-events-none">
            <span className="bg-green-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded">
              Kiemelt
            </span>
          </div>
        )}

        {/* Quick actions */}
        {showQuickActions && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 sm:translate-x-2 sm:group-hover:translate-x-0">
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#FFBB36] hover:text-gray-900 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.info('Kedvencek funkció hamarosan!');
              }}
              title="Kedvencekhez"
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <Link
              href={productUrl}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-[#FFBB36] hover:text-gray-900 transition-colors"
              title="Megtekintés"
            >
              <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full shadow-md flex items-center justify-center transition-colors hover:bg-[#FFBB36] hover:text-gray-900"
              onClick={handleAddToCart}
              title="Kosárba"
            >
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}

        {/* Countdown timer - shown for sale items */}
        {(showCountdown || isOnSale) && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 pointer-events-none">
            <MiniCountdown endDate={endDate} />
          </div>
        )}
      </div>

      {/* Variant pills */}
      {product.variants && product.variants.length > 0 && (
        <div className="mt-2">
          <VariantPills variants={product.variants} productUrl={productUrl} />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "bg-transparent",
        isCollection && "pt-3",
        product.variants && product.variants.length > 0 && "!pt-1"
      )}>
        {/* Category and Rating in one line */}
        <div className={cn(
          "flex items-center justify-between",
          !isCollection && "mt-3"
        )}>
          {category && (
            <Link
              href={`/kategoriak/${category.slug}`}
              className="text-[12px] sm:text-[14px] text-[#6f6f6f] hover:text-[#D4960A] transition-colors"
            >
              {category.name}
            </Link>
          )}
          {showRating && (
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-[#FFBB36] fill-[#FFBB36]" />
              <span className="text-sm font-medium text-gray-900">4.{(product._id.charCodeAt(0) % 5) + 5}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link href={productUrl}>
          <h3 className="font-medium text-gray-900 mt-1 sm:mt-2 line-clamp-2 group-hover:text-[#D4960A] transition-colors text-[13px] sm:text-[16px]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
          <span className="font-bold text-base sm:text-lg text-gray-900">
            {formatPrice(product.basePrice)}
          </span>
          {isOnSale && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}

const MAX_VISIBLE_VARIANTS = 2;

function VariantPills({ variants, productUrl }: { variants: Pick<ProductVariant, '_id' | 'name' | 'slug' | 'attributeValue' | 'price'>[]; productUrl: string }) {
  const visible = variants.slice(0, MAX_VISIBLE_VARIANTS);
  const remaining = variants.length - MAX_VISIBLE_VARIANTS;

  return (
    <div className="flex items-center gap-1.5 mt-2 overflow-hidden">
      {visible.map((v) => (
        <Link
          key={v._id}
          href={v.slug ? `${productUrl}?variant=${v.slug}` : productUrl}
          className="inline-block text-[10px] sm:text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-[#FFBB36]/20 hover:text-gray-900 rounded-full px-2.5 py-0.5 truncate max-w-[120px] sm:max-w-[140px] transition-colors"
          title={v.name || v.attributeValue || ''}
        >
          {v.attributeValue || v.name}
        </Link>
      ))}
      {remaining > 0 && (
        <Link
          href={productUrl}
          className="text-[10px] sm:text-[11px] font-medium text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors"
        >
          +{remaining}
        </Link>
      )}
    </div>
  );
}
