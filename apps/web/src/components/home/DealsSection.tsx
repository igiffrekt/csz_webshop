'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, getImageUrl, stripHtml } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import { toast } from 'sonner';
import type { Product } from '@csz/types';

interface DealsSectionProps {
  products: Product[];
}

export function DealsSection({ products }: DealsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag scrolling state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Scroll position state for arrow visibility
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Get products on sale or first 5 products
  let dealProducts = products
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.basePrice)
    .slice(0, 5);

  if (dealProducts.length < 5) {
    const remaining = products
      .filter((p) => !dealProducts.find((d) => d._id === p._id))
      .slice(0, 5 - dealProducts.length);
    dealProducts = [...dealProducts, ...remaining];
  }

  if (dealProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="site-container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
          <div>
            <span className="text-gray-500 text-sm uppercase tracking-wider">
              Napi ajánlatok
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
              <span className="text-[#FFBB36]">Mai</span> Akciók
            </h2>
          </div>

          <p className="text-gray-600 max-w-md lg:text-right">
            Fedezze fel különleges napi ajánlatainkat! Korlátozott ideig elérhető kedvezmények a legjobb tűzvédelmi termékekre.
          </p>
        </div>
      </div>

      {/* Deals slider - contained within page width with peek effect */}
      <div className="site-container relative overflow-hidden">
        {/* Navigation arrows - only show when can scroll */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
            aria-label="Előző ajánlatok"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
            aria-label="Következő ajánlatok"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Scrollable container - 2 cards visible with 30px gap, peek of 3rd */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex gap-[30px] overflow-x-auto pb-4 scrollbar-hide select-none -mr-[80px] pr-[80px]',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
            !isDragging && 'scroll-smooth snap-x snap-mandatory'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {dealProducts.map((product) => (
            <div
              key={product._id}
              className={cn(
                'flex-shrink-0 w-[85%] sm:w-[calc(50%-15px)] lg:w-[600px] h-[450px]',
                !isDragging && 'snap-start'
              )}
            >
              <DealCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface DealCardProps {
  product: Product;
}

function DealCard({ product }: DealCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Prefer Cloudinary URL (WebP with background removed)
  const imageUrl = product.cloudinaryImageUrl
    || (product.images?.[0] ? getImageUrl(product.images[0].url) : null);

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.basePrice;
  const discountPercent = isOnSale
    ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100)
    : 20;

  const category = product.categories?.[0];

  // Build product URL - use category slug if available
  const productUrl = category
    ? `/${category.slug}/${product.slug}`
    : `/termekek/${product.slug}`;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addItem(product, undefined, 1);
    toast.success('Termék hozzáadva a kosárhoz');
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-[5px] flex flex-col sm:flex-row group overflow-hidden h-full min-h-[450px]">
      {/* Discount badge */}
      {isOnSale && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#FFBB36] text-gray-900 text-xs font-bold px-2.5 py-1 rounded">
            {discountPercent}% off
          </span>
        </div>
      )}

      {/* Image - takes up left portion */}
      <div className="relative w-full sm:w-[45%] h-[200px] sm:h-full flex-shrink-0">
        <Link href={productUrl} className="block h-full">
          <div className="w-full h-full rounded-xl bg-[#f6f6f6] flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <span className="text-6xl">🧯</span>
            )}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5 sm:p-6 justify-between">
        <div>
          {/* Category */}
          {category && (
            <span className="text-[14px] text-[#6f6f6f]">{category.name}</span>
          )}

          {/* Title */}
          <Link href={productUrl}>
            <h3 className="text-[18px] font-bold text-gray-900 mt-1 group-hover:text-[#FFBB36] transition-colors line-clamp-2">
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
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="h-4 w-4 text-[#FFBB36] fill-[#FFBB36]" />
            <span className="text-sm font-medium text-gray-900">4.{(product._id.charCodeAt(0) % 5) + 5}</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mt-3 line-clamp-3">
            {stripHtml(product.shortDescription) || 'Professzionális minőségű termék, CE tanúsítvánnyal. Megbízható tűzvédelem minden környezetben.'}
          </p>
        </div>

        {/* Kosárba button - at bottom */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={cn(
            'mt-4 px-6 py-2.5 rounded-full font-medium text-sm inline-flex items-center gap-2 w-fit transition-colors',
            product.stock <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#FFBB36] text-gray-900 hover:bg-[#e88a00]'
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock <= 0 ? 'Elfogyott' : 'Kosárba'}
        </button>
      </div>
    </div>
  );
}
