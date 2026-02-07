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
  baseRate: number;
  weightThreshold: number;
  weightSurchargePerKg: number;
  freeShippingThreshold: number;
}

const config: ShippingConfig = {
  baseRate: 1990,
  weightThreshold: 5,
  weightSurchargePerKg: 500,
  freeShippingThreshold: 50000,
};

export function calculateShipping(
  totalWeight: number,
  orderSubtotal: number
): number {
  if (orderSubtotal >= config.freeShippingThreshold) {
    return 0;
  }

  let shipping = config.baseRate;

  if (totalWeight > config.weightThreshold) {
    const extraKg = Math.ceil(totalWeight - config.weightThreshold);
    shipping += extraKg * config.weightSurchargePerKg;
  }

  return shipping;
}

export function isValidShippingCountry(country: string): boolean {
  const normalized = country.toLowerCase().trim();
  return (
    normalized === 'magyarorszag' ||
    normalized === 'magyarország' ||
    normalized === 'hungary' ||
    normalized === 'hu'
  );
}

export function getFreeShippingThreshold(): number {
  return config.freeShippingThreshold;
}

export { config as shippingConfig };
