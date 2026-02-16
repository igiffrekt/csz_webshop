'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/lib/formatters';
import type { CartItem as CartItemInterface } from '@csz/types';

interface CartItemProps {
  item: CartItemInterface;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 sm:gap-4 py-4">
      {item.image ? (
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 64px, 80px"
          />
        </div>
      ) : (
        <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-xs">Nincs kép</span>
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium leading-tight text-sm sm:text-base">{item.name}</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mt-1 -mr-2 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
            aria-label="Termék törlése"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {item.variantName && (
          <p className="text-sm">
            <span className="text-muted-foreground">Változat: </span>
            <span className="font-medium">{item.variantName}</span>
          </p>
        )}
        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
        <div className="flex items-center justify-between pt-1">
          <p className="font-semibold">{formatPrice(item.price)}</p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-8 sm:w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Mennyiség csökkentése"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-8 sm:w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
              aria-label="Mennyiség növelése"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
