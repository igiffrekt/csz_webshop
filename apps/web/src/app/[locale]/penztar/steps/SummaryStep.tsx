'use client';

import { useEffect, useState } from 'react';
import { useCheckoutStore } from '@/stores/checkout';
import { useCartItems, useCartCoupon } from '@/stores/cart';
import { calculateTotals, formatHUF, type CalculateTotalsResponse } from '@/lib/checkout-api';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import type { ShippingAddress } from '@csz/types';

interface SummaryStepProps {
  addresses: ShippingAddress[];
}

export function SummaryStep({ addresses }: SummaryStepProps) {
  const {
    shippingAddressId,
    useNewShippingAddress,
    newShippingAddress,
    useSameAsBilling,
    newBillingAddress,
    poReference,
    setCalculatedTotals,
    prevStep,
    nextStep,
  } = useCheckoutStore();

  const items = useCartItems();
  const coupon = useCartCoupon();

  const [totals, setTotals] = useState<CalculateTotalsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get shipping address details
  const shippingAddress = useNewShippingAddress
    ? newShippingAddress
    : addresses.find(a => a.id === shippingAddressId);

  // Get billing address details
  const billingAddress = useSameAsBilling ? shippingAddress : newBillingAddress;

  // Fetch calculated totals from server
  useEffect(() => {
    async function fetchTotals() {
      setLoading(true);
      setError(null);

      const lineItems = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const shippingCountry = shippingAddress?.country || 'Magyarország';

      const result = await calculateTotals({
        lineItems,
        couponCode: coupon?.code,
        shippingCountry,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setTotals(result.data);
        setCalculatedTotals({
          subtotal: result.data.subtotal,
          discount: result.data.discount,
          shipping: result.data.shipping,
          vatAmount: result.data.vatAmount,
          total: result.data.total,
        });
      }

      setLoading(false);
    }

    fetchTotals();
  }, [items, coupon, shippingAddress, setCalculatedTotals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Összegzés számítása...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive rounded-lg">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Hiba történt</span>
        </div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={prevStep}>
          Vissza
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Rendelés összegzése</h2>

      {/* Addresses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Szállítási cím</h3>
          {shippingAddress && (
            <div className="text-sm text-muted-foreground">
              <p>{shippingAddress.recipientName}</p>
              <p>{shippingAddress.street}</p>
              <p>{shippingAddress.postalCode} {shippingAddress.city}</p>
              <p>{shippingAddress.country}</p>
              {shippingAddress.phone && <p>Tel: {shippingAddress.phone}</p>}
            </div>
          )}
        </div>

        {/* Billing Address */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Számlázási cím</h3>
          {billingAddress && (
            <div className="text-sm text-muted-foreground">
              {newBillingAddress?.companyName && !useSameAsBilling && (
                <p className="font-medium">{newBillingAddress.companyName}</p>
              )}
              {newBillingAddress?.vatNumber && !useSameAsBilling && (
                <p>Adószám: {newBillingAddress.vatNumber}</p>
              )}
              <p>{billingAddress.recipientName}</p>
              <p>{billingAddress.street}</p>
              <p>{billingAddress.postalCode} {billingAddress.city}</p>
              <p>{billingAddress.country}</p>
            </div>
          )}
          {useSameAsBilling && (
            <p className="text-xs text-muted-foreground mt-2">
              (Megegyezik a szállítási címmel)
            </p>
          )}
        </div>
      </div>

      {/* PO Reference */}
      {poReference && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Megrendelési hivatkozás</h3>
          <p className="text-sm text-muted-foreground">{poReference}</p>
        </div>
      )}

      {/* Line Items */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Termékek</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatHUF(item.price)}
                  </p>
                </div>
              </div>
              <span className="font-medium">
                {formatHUF(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals with VAT breakdown */}
      {totals && (
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-medium mb-4">Fizetendő összeg</h3>

          <div className="flex justify-between text-sm">
            <span>Részösszeg</span>
            <span>{formatHUF(totals.subtotal)}</span>
          </div>

          {totals.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Kedvezmény {coupon && `(${coupon.code})`}</span>
              <span>-{formatHUF(totals.discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span>Szállítási díj</span>
            <span>
              {totals.shipping === 0 ? (
                <span className="text-green-600">Ingyenes</span>
              ) : (
                formatHUF(totals.shipping)
              )}
            </span>
          </div>

          {totals.shipping === 0 && (
            <p className="text-xs text-muted-foreground">
              Ingyenes szállítás {formatHUF(totals.freeShippingThreshold)} feletti rendeléshez
            </p>
          )}

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Nettó összeg</span>
              <span>{formatHUF(totals.netTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>AFA (27%)</span>
              <span>{formatHUF(totals.vatAmount)}</span>
            </div>
          </div>

          <div className="flex justify-between font-semibold text-lg pt-3 border-t">
            <span>Végösszeg</span>
            <span>{formatHUF(totals.total)}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={prevStep}>
          Vissza
        </Button>
        <Button onClick={nextStep}>
          Tovább a fizetéshez
        </Button>
      </div>
    </div>
  );
}
