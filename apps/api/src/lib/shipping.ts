/**
 * Shipping cost calculation for Hungary
 *
 * Rules:
 * - Base flat rate: 1,990 Ft
 * - Free shipping over 50,000 Ft
 * - Weight surcharge: +500 Ft per kg over 5kg
 * - Shipping restricted to Hungary only
 */

export interface ShippingConfig {
  baseRate: number;              // Base flat rate in HUF
  weightThreshold: number;       // Weight threshold in kg
  weightSurchargePerKg: number;  // Additional charge per kg over threshold
  freeShippingThreshold: number; // Order total for free shipping
}

const config: ShippingConfig = {
  baseRate: 1990,               // 1,990 Ft base
  weightThreshold: 5,           // Over 5kg
  weightSurchargePerKg: 500,    // +500 Ft per kg over 5kg
  freeShippingThreshold: 50000, // Free over 50,000 Ft
};

/**
 * Calculate shipping cost based on order subtotal and total weight.
 * @param totalWeight - Total weight in kg (sum of all items)
 * @param orderSubtotal - Order subtotal in HUF (before shipping)
 * @returns Shipping cost in HUF
 */
export function calculateShipping(
  totalWeight: number,
  orderSubtotal: number
): number {
  // Free shipping over threshold
  if (orderSubtotal >= config.freeShippingThreshold) {
    return 0;
  }

  // Base rate
  let shipping = config.baseRate;

  // Weight surcharge
  if (totalWeight > config.weightThreshold) {
    const extraKg = Math.ceil(totalWeight - config.weightThreshold);
    shipping += extraKg * config.weightSurchargePerKg;
  }

  return shipping;
}

/**
 * Check if shipping address is valid (Hungary only).
 * Accepts various spellings of Hungary.
 */
export function isValidShippingCountry(country: string): boolean {
  const normalized = country.toLowerCase().trim();
  return (
    normalized === 'magyarorszag' ||
    normalized === 'magyarország' ||
    normalized === 'hungary' ||
    normalized === 'hu'
  );
}

/**
 * Get free shipping threshold for display.
 */
export function getFreeShippingThreshold(): number {
  return config.freeShippingThreshold;
}

export { config as shippingConfig };
