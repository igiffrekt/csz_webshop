'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { useCheckoutStore } from '@/stores/checkout';
import { useCartStore, useCartItems, useCartCoupon } from '@/stores/cart';
import { createBankTransferOrder } from '@/lib/checkout-api';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, CreditCard, Banknote, Loader2 } from 'lucide-react';
import type { ShippingAddress } from '@csz/types';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PaymentStepProps {
  addresses: ShippingAddress[];
  userId: number;
}

type PaymentMethod = 'card' | 'bank_transfer';

export function PaymentStep({ addresses, userId }: PaymentStepProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    shippingAddressId,
    useNewShippingAddress,
    newShippingAddress,
    useSameAsBilling,
    newBillingAddress,
    poReference,
    prevStep,
    reset: resetCheckout,
  } = useCheckoutStore();

  const items = useCartItems();
  const coupon = useCartCoupon();
  const clearCart = useCartStore(state => state.clearCart);

  // Prevent duplicate order creation from multiple fetchClientSecret calls
  const clientSecretRef = useRef<string | null>(null);
  const fetchingRef = useRef<Promise<string> | null>(null);

  // Get shipping address details
  const shippingAddress = useNewShippingAddress
    ? newShippingAddress
    : addresses.find(a => a.documentId === shippingAddressId);

  // Get billing address details
  const billingAddress = useSameAsBilling ? undefined : newBillingAddress;

  const fetchClientSecret = useCallback(async () => {
    // Return cached clientSecret if already fetched
    if (clientSecretRef.current) {
      return clientSecretRef.current;
    }

    // If already fetching, wait for that promise
    if (fetchingRef.current) {
      return fetchingRef.current;
    }

    // Start new fetch and store the promise
    fetchingRef.current = (async () => {
      if (!shippingAddress) {
        throw new Error('Szállítási cím szükséges');
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
            country: shippingAddress.country || 'Magyarország',
            phone: shippingAddress.phone,
          },
          billingAddress: billingAddress ? {
            recipientName: billingAddress.recipientName,
            street: billingAddress.street,
            city: billingAddress.city,
            postalCode: billingAddress.postalCode,
            country: billingAddress.country || 'Magyarország',
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
        throw new Error(errorData.error || 'Hiba történt');
      }

      const { clientSecret } = await response.json();

      // Cache the result for future calls
      clientSecretRef.current = clientSecret;

      return clientSecret;
    })();

    return fetchingRef.current;
  }, [items, shippingAddress, billingAddress, coupon, poReference, userId]);

  const handleBankTransfer = async () => {
    if (!shippingAddress) {
      setError('Szállítási cím szükséges');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const lineItems = items.map(item => ({
      productId: item.productDocumentId,
      variantId: item.variantDocumentId,
      quantity: item.quantity,
      name: item.name,
      variantName: item.variantName,
      sku: item.sku,
      price: item.price,
    }));

    const { data, error: apiError } = await createBankTransferOrder({
      lineItems,
      shippingAddress: {
        recipientName: shippingAddress.recipientName,
        street: shippingAddress.street,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'Magyarország',
        phone: shippingAddress.phone,
      },
      billingAddress: billingAddress ? {
        recipientName: billingAddress.recipientName,
        street: billingAddress.street,
        city: billingAddress.city,
        postalCode: billingAddress.postalCode,
        country: billingAddress.country || 'Magyarország',
        companyName: billingAddress.companyName,
        vatNumber: billingAddress.vatNumber,
      } : undefined,
      couponCode: coupon?.code,
      poReference,
      userId,
    });

    if (apiError || !data) {
      setError(apiError || 'Hiba történt a rendelés létrehozásakor');
      setIsSubmitting(false);
      return;
    }

    // Clear cart and checkout state
    clearCart();
    resetCheckout();

    // Redirect to bank transfer instructions page
    router.push(`/hu/penztar/bankatvitel?order_id=${data.orderId}`);
  };

  // Validate we have required data
  if (!shippingAddress) {
    return (
      <div className="p-6 border border-destructive rounded-lg">
        <div className="flex items-center gap-2 text-destructive mb-4">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Hiba</span>
        </div>
        <p className="text-muted-foreground mb-4">Szállítási cím szükséges a fizetéshez.</p>
        <Button variant="outline" onClick={prevStep}>
          Vissza
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fizetés</h2>

      {/* Payment method selection */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Fizetési mód kiválasztása</h3>
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Bankkártya</p>
                <p className="text-sm text-muted-foreground">
                  Visa, Mastercard, Apple Pay, Google Pay
                </p>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer flex-1">
              <Banknote className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Banki átutalás</p>
                <p className="text-sm text-muted-foreground">
                  Utalás a megadott bankszámlára
                </p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Card payment via Stripe */}
      {paymentMethod === 'card' && (
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-4">
            A fizetés biztonságosan a Stripe rendszerén keresztül történik.
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
      )}

      {/* Bank transfer */}
      {paymentMethod === 'bank_transfer' && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Banki átutalás</h3>
            <p className="text-sm text-blue-700">
              A rendelés leadása után megkapja a banki utaláshoz szükséges adatokat.
              A rendelés feldolgozása az utalás beérkezése után kezdődik (általában 1-2 munkanap).
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={handleBankTransfer}
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rendelés feldolgozása...
              </>
            ) : (
              'Rendelés leadása átutalással'
            )}
          </Button>
        </div>
      )}

      <div className="flex justify-start pt-6 border-t">
        <Button variant="outline" onClick={prevStep}>
          Vissza az összegzéshez
        </Button>
      </div>
    </div>
  );
}
