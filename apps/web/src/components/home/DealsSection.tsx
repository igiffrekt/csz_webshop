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
  sectionTitle?: string;
  sectionSubtitle?: string;
}

export function DealsSection({ products, sectionTitle, sectionSubtitle }: DealsSectionProps) {
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
    <section className="py-10 lg:py-20 bg-white">
      <div className="site-container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <span className="inline-block bg-amber-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              {sectionSubtitle || 'Napi ajánlatok'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-gray-900">
              {sectionTitle || <><span className="text-amber-500">Mai</span> Akciók</>}
            </h2>
          </div>

          <p className="text-gray-600 text-sm sm:text-base max-w-md lg:text-right">
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
                'flex-shrink-0 w-[85%] sm:w-[calc(50%-15px)] lg:w-[600px] h-auto sm:h-[450px]',
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

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].url) : null;

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
    addItem(product, undefined, 1);
    toast.success('Termék hozzáadva a kosárhoz');
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl p-[5px] flex flex-col sm:flex-row group overflow-hidden h-full min-h-[320px] sm:min-h-[450px]">
      {/* Discount badge */}
      {isOnSale && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#FFBB36] text-gray-900 text-xs font-bold px-2.5 py-1 rounded">
            {discountPercent}% off
          </span>
        </div>
      )}

      {/* Image - takes up left portion */}
      <div className="relative w-full sm:w-[45%] h-[180px] sm:h-full flex-shrink-0">
        <Link href={productUrl} className="block h-full">
          <div className="w-full h-full rounded-xl bg-[#f6f6f6] flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <span className="text-6xl">🧯</span>
            )}
          </div>
        </Link>
      </div>

      {/* Variant pills - between image and content */}
      {product.variants && product.variants.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 pt-2 sm:hidden">
          {product.variants.slice(0, 2).map((v: any) => (
            <Link
              key={v._id}
              href={v.slug ? `${productUrl}?variant=${v.slug}` : productUrl}
              className="inline-block text-[10px] font-medium text-gray-600 bg-gray-100 hover:bg-[#FFBB36]/20 hover:text-gray-900 rounded-full px-2.5 py-0.5 truncate max-w-[120px] transition-colors"
              title={v.name || v.attributeValue || ''}
            >
              {v.attributeValue || v.name}
            </Link>
          ))}
          {product.variants.length > 2 && (
            <Link
              href={productUrl}
              className="text-[10px] font-medium text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors"
            >
              +{product.variants.length - 2}
            </Link>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 justify-between">
        <div>
          {/* Category */}
          {category && (
            <span className="text-[14px] text-[#6f6f6f]">{category.name}</span>
          )}

          {/* Title */}
          <Link href={productUrl}>
            <h3 className="text-base sm:text-[18px] font-bold text-gray-900 mt-1 group-hover:text-[#D4960A] transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-center gap-3 mt-2 sm:mt-3">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {formatPrice(product.basePrice)}
            </span>
            {isOnSale && (
              <span className="text-sm sm:text-base text-gray-400 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="h-4 w-4 text-[#FFBB36] fill-[#FFBB36]" />
            <span className="text-sm font-medium text-gray-900">4.{(product._id.charCodeAt(0) % 5) + 5}</span>
          </div>

          {/* Variant pills - desktop (inside content area) */}
          {product.variants && product.variants.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 mt-2">
              {product.variants.slice(0, 2).map((v: any) => (
                <Link
                  key={v._id}
                  href={v.slug ? `${productUrl}?variant=${v.slug}` : productUrl}
                  className="inline-block text-[11px] font-medium text-gray-600 bg-gray-100 hover:bg-[#FFBB36]/20 hover:text-gray-900 rounded-full px-2.5 py-0.5 truncate max-w-[140px] transition-colors"
                  title={v.name || v.attributeValue || ''}
                >
                  {v.attributeValue || v.name}
                </Link>
              ))}
              {product.variants.length > 2 && (
                <Link
                  href={productUrl}
                  className="text-[11px] font-medium text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors"
                >
                  +{product.variants.length - 2}
                </Link>
              )}
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 text-sm mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3">
            {stripHtml(product.shortDescription) || 'Professzionális minőségű termék, CE tanúsítvánnyal. Megbízható tűzvédelem minden környezetben.'}
          </p>
        </div>

        {/* Kosárba button - at bottom */}
        <button
          onClick={handleAddToCart}
          className="mt-3 sm:mt-4 px-6 py-2.5 rounded-full font-medium text-sm inline-flex items-center justify-center gap-2 w-full sm:w-fit transition-colors bg-[#FFBB36] text-gray-900 hover:bg-[#e88a00]"
        >
          <ShoppingCart className="h-4 w-4" />
          Kosárba
        </button>
      </div>
    </div>
  );
}
