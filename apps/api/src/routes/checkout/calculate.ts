import type { FastifyPluginAsync } from 'fastify';
import qs from 'qs';
import { calculateVatFromGross } from '../../lib/vat.js';
import { calculateShipping, isValidShippingCountry } from '../../lib/shipping.js';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

interface LineItem {
  productId: string;      // documentId
  variantId?: string;     // documentId
  quantity: number;
}

interface CalculateBody {
  lineItems: LineItem[];
  couponCode?: string;
  shippingCountry: string;
}

interface CalculateResponse {
  subtotal: number;
  discount: number;
  shipping: number;
  netTotal: number;
  vatAmount: number;
  total: number;
  freeShippingThreshold: number;
  couponApplied: boolean;
  couponError?: string;
}

async function fetchProductPrices(lineItems: LineItem[]): Promise<Map<string, { price: number; weight: number }>> {
  const prices = new Map<string, { price: number; weight: number }>();

  // Fetch products
  const productIds = [...new Set(lineItems.filter(li => !li.variantId).map(li => li.productId))];
  if (productIds.length > 0) {
    const query = qs.stringify({
      filters: { documentId: { $in: productIds } },
      fields: ['documentId', 'basePrice', 'weight'],
    });

    const res = await fetch(`${STRAPI_URL}/api/products?${query}`);
    if (res.ok) {
      const json = await res.json();
      for (const product of json.data || []) {
        prices.set(product.documentId, {
          price: product.basePrice,
          weight: product.weight || 0,
        });
      }
    }
  }

  // Fetch variants
  const variantIds = [...new Set(lineItems.filter(li => li.variantId).map(li => li.variantId!))];
  if (variantIds.length > 0) {
    const query = qs.stringify({
      filters: { documentId: { $in: variantIds } },
      fields: ['documentId', 'price', 'weight'],
    });

    const res = await fetch(`${STRAPI_URL}/api/product-variants?${query}`);
    if (res.ok) {
      const json = await res.json();
      for (const variant of json.data || []) {
        prices.set(variant.documentId, {
          price: variant.price,
          weight: variant.weight || 0,
        });
      }
    }
  }

  return prices;
}

async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; error?: string }> {
  const query = qs.stringify({
    filters: { code: { $eqi: code } },
  });

  const res = await fetch(`${STRAPI_URL}/api/coupons?${query}`);
  if (!res.ok) {
    return { valid: false, discount: 0, error: 'Kupon ellenorzese sikertelen' };
  }

  const json = await res.json();
  const coupons = json.data || [];

  if (coupons.length === 0) {
    return { valid: false, discount: 0, error: 'Ervenytelen kuponkod' };
  }

  const coupon = coupons[0];

  // Check if active
  if (!coupon.isActive) {
    return { valid: false, discount: 0, error: 'Ez a kupon mar nem aktiv' };
  }

  // Check dates
  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return { valid: false, discount: 0, error: 'Ez a kupon meg nem ervenyes' };
  }
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { valid: false, discount: 0, error: 'Ez a kupon mar lejart' };
  }

  // Check usage limit
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, error: 'Ez a kupon elerte a felhasznalasi limitet' };
  }

  // Check minimum order
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      discount: 0,
      error: `Minimum rendelesi ertek: ${coupon.minOrderValue.toLocaleString('hu-HU')} Ft`
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round(subtotal * (coupon.discountValue / 100));
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  // Cap at subtotal
  discount = Math.min(discount, subtotal);

  return { valid: true, discount };
}

export const calculateRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /checkout/calculate - Calculate order totals
  fastify.post<{ Body: CalculateBody }>('/calculate', async (request, reply) => {
    const { lineItems, couponCode, shippingCountry } = request.body;

    // Validate shipping country
    if (!isValidShippingCountry(shippingCountry)) {
      return reply.status(400).send({
        error: 'Sajnos csak Magyarorszagra szallitunk',
      });
    }

    if (!lineItems || lineItems.length === 0) {
      return reply.status(400).send({
        error: 'A kosar ures',
      });
    }

    // Fetch current prices from database (NEVER trust client prices)
    const prices = await fetchProductPrices(lineItems);

    // Calculate subtotal and total weight
    let subtotal = 0;
    let totalWeight = 0;

    for (const item of lineItems) {
      const key = item.variantId || item.productId;
      const priceInfo = prices.get(key);

      if (!priceInfo) {
        return reply.status(400).send({
          error: `Termek nem talalhato: ${key}`,
        });
      }

      subtotal += priceInfo.price * item.quantity;
      totalWeight += priceInfo.weight * item.quantity;
    }

    // Validate and apply coupon
    let discount = 0;
    let couponApplied = false;
    let couponError: string | undefined;

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal);
      if (couponResult.valid) {
        discount = couponResult.discount;
        couponApplied = true;
      } else {
        couponError = couponResult.error;
      }
    }

    // Calculate shipping
    const discountedSubtotal = subtotal - discount;
    const shipping = calculateShipping(totalWeight, discountedSubtotal);

    // Calculate total and VAT
    const total = discountedSubtotal + shipping;
    const { netPrice, vatAmount } = calculateVatFromGross(total);

    const response: CalculateResponse = {
      subtotal,
      discount,
      shipping,
      netTotal: netPrice,
      vatAmount,
      total,
      freeShippingThreshold: 50000,
      couponApplied,
      couponError,
    };

    return reply.send(response);
  });
};
