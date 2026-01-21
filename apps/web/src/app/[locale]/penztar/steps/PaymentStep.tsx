'use client';

import { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { useCheckoutStore } from '@/stores/checkout';
import { useCartItems, useCartCoupon } from '@/stores/cart';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import type { ShippingAddress } from '@csz/types';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PaymentStepProps {
  addresses: ShippingAddress[];
  userId: number;
}

export function PaymentStep({ addresses, userId }: PaymentStepProps) {
  const {
    shippingAddressId,
    useNewShippingAddress,
    newShippingAddress,
    useSameAsBilling,
    newBillingAddress,
    poReference,
    prevStep,
  } = useCheckoutStore();

  const items = useCartItems();
  const coupon = useCartCoupon();

  // Get shipping address details
  const shippingAddress = useNewShippingAddress
    ? newShippingAddress
    : addresses.find(a => a.documentId === shippingAddressId);

  // Get billing address details
  const billingAddress = useSameAsBilling ? undefined : newBillingAddress;

  const fetchClientSecret = useCallback(async () => {
    if (!shippingAddress) {
      throw new Error('Szallitasi cim szukseges');
    }

    const lineItems = items.map(item => ({
      productId: item.productDocumentId,
      variantId: item.variantDocumentId,
      quantity: item.quantity,
      name: item.name,
      variantName: item.variantName,
      sku: item.sku,
      price: item.price,
    }));

    const response = await fetch(`${API_URL}/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lineItems,
        shippingAddress: {
          recipientName: shippingAddress.recipientName,
          street: shippingAddress.street,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country || 'Magyarorszag',
          phone: shippingAddress.phone,
        },
        billingAddress: billingAddress ? {
          recipientName: billingAddress.recipientName,
          street: billingAddress.street,
          city: billingAddress.city,
          postalCode: billingAddress.postalCode,
          country: billingAddress.country || 'Magyarorszag',
          companyName: billingAddress.companyName,
          vatNumber: billingAddress.vatNumber,
        } : undefined,
        couponCode: coupon?.code,
        poReference,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Hiba tortent');
    }

    const { clientSecret } = await response.json();
    return clientSecret;
  }, [items, shippingAddress, billingAddress, coupon, poReference, userId]);

  // Validate we have required data
  if (!shippingAddress) {
    return (
      <div className="p-6 border border-destructive rounded-lg">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Hiba</span>
        </div>
        <p className="text-muted-foreground mb-4">Szallitasi cim szukseges a fizeteshez.</p>
        <Button variant="outline" onClick={prevStep}>
          Vissza
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fizetes</h2>

      <div className="border rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-4">
          A fizetes biztonsagosan a Stripe rendszeren keresztul tortenik.
          Elfogadjuk a kartyas fizeteseket, Apple Pay-t es Google Pay-t.
        </p>

        <div id="checkout">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>

      <div className="flex justify-start pt-6 border-t">
        <Button variant="outline" onClick={prevStep}>
          Vissza az osszegzeshez
        </Button>
      </div>
    </div>
  );
}
