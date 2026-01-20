import type { AppliedCoupon } from '@csz/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CouponValidationResponse {
  valid: boolean;
  error?: string;
  coupon?: AppliedCoupon;
}

/**
 * Validate and apply a coupon code
 * @param code - The coupon code to validate
 * @param subtotal - Current cart subtotal in HUF
 * @returns Validation result with coupon data or error
 */
export async function applyCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResponse> {
  const response = await fetch(`${API_URL}/cart/apply-coupon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, subtotal }),
  });

  if (!response.ok) {
    return {
      valid: false,
      error: 'Hiba tortent a kupon ellenorzese soran',
    };
  }

  return response.json();
}
