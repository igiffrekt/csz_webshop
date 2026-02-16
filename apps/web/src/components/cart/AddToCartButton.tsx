'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import type { Product, ProductVariant } from '@csz/types';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant | null;
  quantity?: number;
  disabled?: boolean;
  requiresVariant?: boolean;
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  disabled,
  requiresVariant = false,
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle');
  const addItem = useCartStore((state) => state.addItem);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (status !== 'idle') return;

    // Check if variant is required but not selected
    if (requiresVariant && !variant) {
      toast.error('Kérem válasszon méretet');
      return;
    }

    // Check stock
    const stock = variant?.stock ?? product.stock;
    if (stock === 0) {
      toast.error('A termék nincs készleten');
      return;
    }

    setStatus('adding');

    // Small delay for visual feedback, then add to cart
    timeoutRef.current = setTimeout(() => {
      try {
        addItem(product, variant ?? undefined, quantity);
        setStatus('added');

        toast.success('Hozzáadva a kosárhoz', {
          description: variant
            ? `${product.name} - ${variant.name || variant.attributeValue}`
            : product.name,
        });

        // Reset after showing success
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, 1500);
      } catch (error) {
        console.error('Add to cart error:', error);
        toast.error('Hiba történt a kosárba helyezéskor');
        setStatus('idle');
      }
    }, 300);
  };

  const stock = variant?.stock ?? product.stock;
  const isOutOfStock = stock === 0;
  const needsVariant = requiresVariant && !variant;

  const getButtonContent = () => {
    if (status === 'adding') {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (status === 'added') {
      return (
        <span className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Hozzáadva!
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        {isOutOfStock ? 'Elfogyott' : needsVariant ? 'Válasszon méretet' : 'Kosárba'}
      </span>
    );
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isOutOfStock || status !== 'idle'}
      className={`
        w-full sm:w-auto min-w-[180px] h-[52px] sm:h-[48px] px-8 rounded-full font-semibold text-sm
        transition-all duration-200 flex items-center justify-center gap-2
        ${status === 'added'
          ? 'bg-green-500 text-white'
          : isOutOfStock || needsVariant
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lg sm:shadow-none'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {getButtonContent()}
    </button>
  );
}
