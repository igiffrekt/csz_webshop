'use client';

import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag } from 'lucide-react';
import { useCartItems } from '@/stores/cart';
import { useHydration } from '@/stores/useHydration';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const items = useCartItems();
  const hydrated = useHydration();

  // Don't render content until hydrated to prevent mismatch
  if (!hydrated) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Kosar</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Betoltes...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            Kosar {itemCount > 0 && `(${itemCount} termek)`}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-muted-foreground">A kosar ures</p>
            <Button variant="outline" onClick={() => onOpenChange(false)} asChild>
              <Link href="/termekek">Bongesszen termekeink kozott</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 space-y-4">
              <Separator />
              <CartSummary />
            </div>

            <SheetFooter className="mt-4 sm:flex-col sm:space-x-0 gap-2">
              <Button
                asChild
                size="lg"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                <Link href="/penztar">Tovabb a penztarhoz</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/termekek">Folytassa a vasarlast</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
