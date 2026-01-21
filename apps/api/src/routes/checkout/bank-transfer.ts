import type { FastifyPluginAsync } from 'fastify';
import qs from 'qs';
import { calculateVatFromGross } from '../../lib/vat.js';
import { calculateShipping } from '../../lib/shipping.js';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Bank account details for bank transfer
const BANK_ACCOUNT = {
  accountHolder: 'CSZ Tuzvedelmi Kft.',
  bankName: 'OTP Bank',
  iban: 'HU12 1234 5678 9012 3456 7890 1234',
  bic: 'OTPVHUHB',
};

interface LineItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  variantName?: string;
  sku: string;
  price: number;
}

interface AddressInput {
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  companyName?: string;
  vatNumber?: string;
}

interface BankTransferBody {
  lineItems: LineItemInput[];
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  couponCode?: string;
  poReference?: string;
  userId: number;
}

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CSZ-${year}-${timestamp}${random}`;
}

async function fetchProductPrices(lineItems: LineItemInput[]): Promise<Map<string, { price: number; weight: number }>> {
  const prices = new Map<string, { price: number; weight: number }>();

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

async function validateAndCalculateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number }> {
  const query = qs.stringify({
    filters: { code: { $eqi: code } },
  });

  const res = await fetch(`${STRAPI_URL}/api/coupons?${query}`);
  if (!res.ok) return { valid: false, discount: 0 };

  const json = await res.json();
  const coupons = json.data || [];
  if (coupons.length === 0) return { valid: false, discount: 0 };

  const coupon = coupons[0];

  if (!coupon.isActive) return { valid: false, discount: 0 };

  const now = new Date();
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return { valid: false, discount: 0 };
  if (coupon.validUntil && new Date(coupon.validUntil) < now) return { valid: false, discount: 0 };
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0 };
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) return { valid: false, discount: 0 };

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round(subtotal * (coupon.discountValue / 100));
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }

  return { valid: true, discount: Math.min(discount, subtotal) };
}

export const bankTransferRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /checkout/bank-transfer - Create order for bank transfer payment
  fastify.post<{ Body: BankTransferBody }>('/bank-transfer', async (request, reply) => {
    const {
      lineItems,
      shippingAddress,
      billingAddress,
      couponCode,
      poReference,
      userId,
    } = request.body;

    if (!lineItems || lineItems.length === 0) {
      return reply.status(400).send({ error: 'A kosar ures' });
    }

    if (!shippingAddress) {
      return reply.status(400).send({ error: 'Szallitasi cim szukseges' });
    }

    if (!userId) {
      return reply.status(400).send({ error: 'Felhasznalo azonosito szukseges' });
    }

    try {
      // Fetch current prices
      const prices = await fetchProductPrices(lineItems);

      // Calculate totals
      let subtotal = 0;
      let totalWeight = 0;
      const verifiedLineItems: Array<{
        productId: string;
        variantId?: string;
        name: string;
        variantName?: string;
        sku: string;
        price: number;
        quantity: number;
        total: number;
      }> = [];

      for (const item of lineItems) {
        const key = item.variantId || item.productId;
        const priceInfo = prices.get(key);

        if (!priceInfo) {
          return reply.status(400).send({ error: `Termek nem talalhato: ${item.name}` });
        }

        subtotal += priceInfo.price * item.quantity;
        totalWeight += priceInfo.weight * item.quantity;

        verifiedLineItems.push({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          variantName: item.variantName,
          sku: item.sku,
          price: priceInfo.price,
          quantity: item.quantity,
          total: priceInfo.price * item.quantity,
        });
      }

      // Apply coupon
      let discount = 0;
      if (couponCode) {
        const couponResult = await validateAndCalculateCoupon(couponCode, subtotal);
        if (couponResult.valid) {
          discount = couponResult.discount;
        }
      }

      // Calculate shipping
      const discountedSubtotal = subtotal - discount;
      const shipping = calculateShipping(totalWeight, discountedSubtotal);

      // Calculate VAT and total
      const total = discountedSubtotal + shipping;
      const { vatAmount } = calculateVatFromGross(total);

      // Generate order number
      const orderNumber = await generateOrderNumber();

      // Create order with pending status
      const response = await fetch(`${STRAPI_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            orderNumber,
            status: 'pending',
            user: userId,
            subtotal,
            discount,
            shipping,
            vatAmount,
            total,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            lineItems: verifiedLineItems,
            couponCode: discount > 0 ? couponCode : undefined,
            couponDiscount: discount > 0 ? discount : undefined,
            poReference,
            paymentMethod: 'bank_transfer',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create order: ${JSON.stringify(error)}`);
      }

      const json = await response.json();

      return reply.send({
        orderId: json.data.documentId,
        orderNumber: json.data.orderNumber,
        total,
        bankAccount: BANK_ACCOUNT,
        paymentReference: `CSZ-${json.data.orderNumber}`,
      });
    } catch (error) {
      fastify.log.error(error, 'Failed to create bank transfer order');
      return reply.status(500).send({
        error: 'Hiba tortent a rendeles letrehozasakor',
      });
    }
  });
};
