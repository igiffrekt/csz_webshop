'use client';

import { useCartSubtotal, useCartDiscount, useCartTotal, useCartCoupon } from '@/stores/cart';
import { formatPrice } from '@/lib/formatters';
import { Separator } from '@/components/ui/separator';

export function CartSummary() {
  const subtotal = useCartSubtotal();
  const discount = useCartDiscount();
  const total = useCartTotal();
  const coupon = useCartCoupon();

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Részösszeg</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      {coupon && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Kedvezmény ({coupon.code})</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}

      <Separator />

      <div className="flex justify-between font-semibold text-lg">
        <span>Összesen</span>
        <span>{formatPrice(total)}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Az árak tartalmazzák a 27% ÁFÁ-t
      </p>
    </div>
  );
}
