'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart';
import { useCheckoutStore } from '@/stores/checkout';
import { formatOrderStatus, formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { CheckCircle, Package, Mail } from 'lucide-react';
import type { Order } from '@csz/types';

interface OrderConfirmationProps {
  order: Order;
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const clearCart = useCartStore((state) => state.clearCart);
  const resetCheckout = useCheckoutStore((state) => state.reset);

  // Clear cart and checkout state on mount
  useEffect(() => {
    clearCart();
    resetCheckout();
  }, [clearCart, resetCheckout]);

  const status = formatOrderStatus(order.status);

  return (
    <div className="space-y-8">
      {/* Success header */}
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Köszönjük a rendelését!</h1>
        <p className="text-muted-foreground">
          A rendelés száma: <span className="font-mono font-medium">{order.orderNumber}</span>
        </p>
      </div>

      {/* Order status */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Rendelés állapota</h2>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>Email értesítést küldtünk a megadott email címre</span>
        </div>
      </div>

      {/* Order details */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold">Rendelés részletei</h2>

        {/* Line items */}
        <div className="space-y-3">
          {order.lineItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">{item.name}</span>
                {item.variantName && (
                  <span className="text-muted-foreground"> - {item.variantName}</span>
                )}
                <span className="text-muted-foreground"> x {item.quantity}</span>
              </div>
              <span>{formatPrice(item.total)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Részösszeg</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Kedvezmény {order.couponCode && `(${order.couponCode})`}</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Szállítás</span>
            <span>{order.shipping === 0 ? 'Ingyenes' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>ÁFA (27%)</span>
            <span>{formatPrice(order.vatAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Összesen</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5" />
          <h2 className="font-semibold">Szállítási cím</h2>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{order.shippingAddress.recipientName}</p>
          <p>{order.shippingAddress.street}</p>
          <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
          <p>{order.shippingAddress.country}</p>
          {order.shippingAddress.phone && <p>Tel: {order.shippingAddress.phone}</p>}
        </div>
      </div>

      {/* PO Reference */}
      {order.poReference && (
        <div className="border rounded-lg p-6">
          <h2 className="font-semibold mb-2">Megrendelési hivatkozás</h2>
          <p className="text-sm text-muted-foreground font-mono">{order.poReference}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button asChild className="flex-1">
          <Link href="/fiok/rendelesek">Rendeléseim</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/termekek">Vásárlás folytatása</Link>
        </Button>
      </div>
    </div>
  );
}
