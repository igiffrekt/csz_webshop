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
    <div className="flex gap-4 py-4">
      {item.image ? (
        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      ) : (
        <div className="h-20 w-20 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-xs">Nincs kép</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.name}</h4>
        {item.variantName && (
          <p className="text-sm text-muted-foreground">{item.variantName}</p>
        )}
        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
        <p className="font-semibold mt-1">{formatPrice(item.price)}</p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => removeItem(item.id)}
          aria-label="Termék törlése"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
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
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.maxStock}
            aria-label="Mennyiség növelése"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
