/**
 * Hungarian VAT calculation utilities
 * VAT rate: 27% (fixed by Hungarian law)
 *
 * Hungarian e-commerce displays gross prices (VAT included).
 * These utilities extract the VAT breakdown from gross prices.
 */

const HUNGARIAN_VAT_RATE = 0.27;

export interface VatBreakdown {
  netPrice: number;    // Price without VAT
  vatAmount: number;   // VAT amount
  grossPrice: number;  // Price with VAT (what customer pays)
}

/**
 * Calculate VAT breakdown from gross price (price includes VAT).
 * Uses integer math to avoid floating point issues with HUF.
 */
export function calculateVatFromGross(grossPrice: number): VatBreakdown {
  const netPrice = Math.round(grossPrice / (1 + HUNGARIAN_VAT_RATE));
  const vatAmount = grossPrice - netPrice;

  return {
    netPrice,
    vatAmount,
    grossPrice,
  };
}

/**
 * Calculate VAT amount to add to net price.
 */
export function calculateVatAmount(netPrice: number): number {
  return Math.round(netPrice * HUNGARIAN_VAT_RATE);
}

export const VAT_RATE = HUNGARIAN_VAT_RATE;
