'use client';

import { useState } from 'react';
import { X, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCartStore, useCartSubtotal, useCartCoupon } from '@/stores/cart';
import { applyCoupon as applyCouponApi } from '@/lib/cart-api';

export function CouponInput() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useCartSubtotal();
  const coupon = useCartCoupon();
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Kerem adja meg a kuponkodot');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await applyCouponApi(trimmedCode, subtotal);

      if (result.valid && result.coupon) {
        applyCoupon(result.coupon);
        toast.success('Kupon sikeresen alkalmazva!', {
          description: result.coupon.discountType === 'percentage'
            ? `${result.coupon.discountValue}% kedvezmeny`
            : `${result.coupon.discountAmount.toLocaleString('hu-HU')} Ft kedvezmeny`,
        });
        setCode('');
      } else {
        setError(result.error || 'Ervenytelen kuponkod');
      }
    } catch {
      setError('Hiba tortent a kupon ellenorzese soran');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info('Kupon eltavolitva');
  };

  // If coupon already applied, show it
  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {coupon.code}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400">
            {coupon.discountType === 'percentage'
              ? `${coupon.discountValue}% kedvezmeny`
              : `${coupon.discountAmount.toLocaleString('hu-HU')} Ft`}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveCoupon}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
          aria-label="Kupon eltavolitasa"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Coupon input form
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Kuponkod"
          className="flex-1 uppercase"
          disabled={isLoading}
          aria-label="Kuponkod"
          aria-invalid={!!error}
          aria-describedby={error ? 'coupon-error' : undefined}
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Alkalmaz'
          )}
        </Button>
      </div>
      {error && (
        <p id="coupon-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
