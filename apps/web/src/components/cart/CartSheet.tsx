'use client';

import { Link } from '@/i18n/navigation';
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { CouponInput } from './CouponInput';

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
        <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Kosár</SheetTitle>
            <SheetDescription className="sr-only">A kosár tartalma</SheetDescription>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Betöltés...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>
            Kosár {itemCount > 0 && `(${itemCount} termék)`}
          </SheetTitle>
          <SheetDescription className="sr-only">A kosár tartalma és összegzés</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-muted-foreground">A kosár üres</p>
            <Button variant="outline" onClick={() => onOpenChange(false)} asChild>
              <Link href="/termekek">Böngésszen termékeink között</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 pt-4 space-y-4 border-t">
              <CouponInput />
              <Separator />
              <CartSummary />
            </div>

            <SheetFooter className="p-4 sm:p-6 pt-0 sm:flex-col sm:space-x-0 gap-2">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 h-12"
                onClick={() => onOpenChange(false)}
              >
                <Link href="/penztar">
                  <span className="mr-2 text-[0.5rem] leading-none">&#9679;</span>
                  Tovább a pénztárhoz
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12"
                onClick={() => onOpenChange(false)}
                asChild
              >
                <Link href="/termekek">Folytassa a vásárlást</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
