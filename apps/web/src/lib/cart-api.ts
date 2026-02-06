import type { AppliedCoupon } from '@csz/types'

export interface CouponValidationResponse {
  valid: boolean
  error?: string
  coupon?: AppliedCoupon
}

/**
 * Validate and apply a coupon code
 */
export async function applyCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResponse> {
  const response = await fetch('/api/cart/apply-coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, subtotal }),
  })

  if (!response.ok) {
    return { valid: false, error: 'Hiba történt a kupon ellenőrzése során' }
  }

  return response.json()
}
