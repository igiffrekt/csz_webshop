'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartItemCount } from '@/stores/cart';
import { useHydration } from '@/stores/useHydration';

interface CartIconProps {
  onClick?: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const itemCount = useCartItemCount();
  const hydrated = useHydration();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="relative"
      aria-label={`Kosar${hydrated && itemCount > 0 ? ` (${itemCount} termek)` : ''}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {hydrated && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
