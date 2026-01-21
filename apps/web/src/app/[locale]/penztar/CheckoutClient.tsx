'use client';

import { useEffect } from 'react';
import { useCheckoutStore, useCheckoutStep } from '@/stores/checkout';
import { useCartStore, useCartItems } from '@/stores/cart';
import { useHydration } from '@/stores/useHydration';
import { ShippingStep } from './steps/ShippingStep';
import { BillingStep } from './steps/BillingStep';
import { SummaryStep } from './steps/SummaryStep';
import { PaymentStep } from './steps/PaymentStep';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { ShippingAddress } from '@csz/types';

// Step indicator component
function StepIndicator({ currentStep }: { currentStep: string }) {
  const steps = [
    { key: 'shipping', label: 'Szállítás' },
    { key: 'billing', label: 'Számlázás' },
    { key: 'summary', label: 'Összegzés' },
    { key: 'payment', label: 'Fizetés' },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <nav className="mb-8">
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-center">
            <span
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${index <= currentIndex
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {index + 1}
            </span>
            <span
              className={`ml-2 text-sm ${index === currentIndex ? 'font-medium' : 'text-muted-foreground'}`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="mx-4 h-px w-8 bg-border" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface CheckoutClientProps {
  initialAddresses: ShippingAddress[];
  userId: number;
}

export function CheckoutClient({ initialAddresses, userId }: CheckoutClientProps) {
  const hydrated = useHydration();
  const step = useCheckoutStep();
  const items = useCartItems();
  const cartStore = useCartStore();

  // Reset checkout if cart is empty (after hydration)
  useEffect(() => {
    if (hydrated && items.length === 0) {
      useCheckoutStore.getState().reset();
    }
  }, [hydrated, items.length]);

  // Show loading state during hydration
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">A kosara üres.</p>
        <Button asChild>
          <Link href="/termekek">Termékek böngészése</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator currentStep={step} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main checkout form */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <ShippingStep addresses={initialAddresses} />
          )}
          {step === 'billing' && <BillingStep />}
          {step === 'summary' && <SummaryStep addresses={initialAddresses} />}
          {step === 'payment' && (
            <PaymentStep addresses={initialAddresses} userId={userId} />
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="font-semibold mb-4">Rendelés összegzése</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} {item.variantName && `(${item.variantName})`} x {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString('hu-HU')} Ft</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Részösszeg</span>
                <span>{cartStore.getSubtotal().toLocaleString('hu-HU')} Ft</span>
              </div>
              {cartStore.coupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Kedvezmény ({cartStore.coupon.code})</span>
                  <span>-{cartStore.getDiscount().toLocaleString('hu-HU')} Ft</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Szállítás</span>
                <span className="text-muted-foreground">Számolva...</span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Összesen</span>
                <span>{cartStore.getTotal().toLocaleString('hu-HU')} Ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
