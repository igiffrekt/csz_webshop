'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCardEnhanced } from '@/components/product/ProductCardEnhanced';
import type { Product } from '@csz/types';

interface ProductCollectionsProps {
  products: Product[];
  featuredProducts?: Product[];
}

const tabs = [
  { id: 'all', label: 'Összes termék' },
  { id: 'latest', label: 'Legújabb' },
  { id: 'bestsellers', label: 'Legnépszerűbb' },
  { id: 'featured', label: 'Kiemelt termékek' },
] as const;

export function ProductCollections({
  products,
  featuredProducts = [],
}: ProductCollectionsProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
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
  }, [updateScrollState, activeTab]);

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
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getFilteredProducts = () => {
    switch (activeTab) {
      case 'featured':
        return featuredProducts.length > 0
          ? featuredProducts
          : products.filter((p) => p.isFeatured);
      case 'latest':
        return [...products].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'bestsellers':
        return [...products].sort((a, b) => (b.stock || 0) - (a.stock || 0));
      default:
        return products;
    }
  };

  // Show up to 15 products in the slider
  const displayProducts = getFilteredProducts().slice(0, 15);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="site-container">
        {/* Section header */}
        <div className="text-center mb-8">
          <span className="text-gray-500 text-sm uppercase tracking-wider">
            Termékeink
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">
            Termékkínálatunk
          </h2>
        </div>

        {/* Pill-shaped filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border',
                activeTab === tab.id
                  ? 'bg-[#FFBB36] border-[#FFBB36] text-black'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product slider - contained within page width with peek effect */}
      <div className="site-container relative overflow-hidden">
        {/* Navigation arrows - only show when can scroll */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
            aria-label="Előző termékek"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
            aria-label="Következő termékek"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        )}

        {/* Scrollable container with drag support - extends right for peek effect */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex gap-5 overflow-x-auto pb-4 scrollbar-hide select-none -mr-[60px] pr-[60px]',
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
          {displayProducts.map((product) => (
            <div
              key={product.documentId}
              className={cn(
                'flex-shrink-0 w-[280px] md:w-[290px]',
                !isDragging && 'snap-start'
              )}
            >
              <ProductCardEnhanced product={product} showCountdown={false} variant="collection" />
            </div>
          ))}
        </div>
      </div>

      {/* View all button */}
      <div className="text-center mt-10">
        <Link
          href="/termekek"
          className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
        >
          Összes termék megtekintése
        </Link>
      </div>
    </section>
  );
}
