'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

    // Use setTimeout to ensure state updates properly
    setTimeout(() => {
      try {
        addItem(product, variant ?? undefined, quantity);
        setStatus('added');

        toast.success('Hozzáadva a kosárhoz', {
          description: variant
            ? `${product.name} - ${variant.name || variant.attributeValue}`
            : product.name,
        });

        // Reset after showing success
        setTimeout(() => setStatus('idle'), 1500);
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

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isOutOfStock || status !== 'idle'}
      className="relative overflow-hidden min-w-[160px]"
      size="lg"
    >
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {isOutOfStock ? 'Elfogyott' : needsVariant ? 'Valasszon meretet' : 'Kosarba'}
          </motion.span>
        )}

        {status === 'adding' && (
          <motion.span
            key="adding"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.span>
        )}

        {status === 'added' && (
          <motion.span
            key="added"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2 text-green-50"
          >
            <Check className="h-4 w-4" />
            Hozzaadva!
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
