'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CartSheet } from '@/components/cart/CartSheet';
import { useCartTotal, useCartItemCount } from '@/stores/cart';
import { useHydration } from '@/stores/useHydration';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface HeaderCartProps {
  showTotal?: boolean;
}

export function HeaderCart({ showTotal = false }: HeaderCartProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const total = useCartTotal();
  const itemCount = useCartItemCount();
  const hydrated = useHydration();
  const prevCountRef = useRef(itemCount);

  // Trigger animation when item count increases
  useEffect(() => {
    if (hydrated && itemCount > prevCountRef.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount, hydrated]);

  return (
    <>
      <button
        onClick={() => setCartOpen(true)}
        className="flex items-center gap-[5px] hover:opacity-70 transition-opacity relative"
        aria-label={`Kosár${hydrated && itemCount > 0 ? ` (${itemCount} termék)` : ''}`}
      >
        {/* Cart icon with animation */}
        <div className={cn(
          "relative",
          isAnimating && "animate-cart-wiggle"
        )}>
          <Image src="/icons/shop-bag-icon.svg" alt="Kosár" width={24} height={24} />

          {/* Item count badge */}
          {hydrated && itemCount > 0 && (
            <span
              className={cn(
                "absolute -top-2 -right-2 min-w-[20px] h-[20px] flex items-center justify-center",
                "bg-[#FFBB36] text-gray-900 text-xs font-bold rounded-full px-1",
                "shadow-sm border-2 border-white",
                isAnimating && "animate-badge-pop"
              )}
            >
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>

        {showTotal && hydrated && (
          <span className="text-[16px] text-black leading-[1.15] hidden md:inline">
            {formatPrice(total)}
          </span>
        )}
      </button>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
