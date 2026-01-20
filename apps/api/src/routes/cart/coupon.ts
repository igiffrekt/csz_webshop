import { FastifyInstance } from 'fastify';
import qs from 'qs';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

interface ApplyCouponBody {
  code: string;
  subtotal: number;
}

interface CouponResponse {
  valid: boolean;
  error?: string;
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  };
}

interface StrapiCoupon {
  id: number;
  documentId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
}

export async function couponRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: ApplyCouponBody }>(
    '/cart/apply-coupon',
    {
      schema: {
        body: {
          type: 'object',
          required: ['code', 'subtotal'],
          properties: {
            code: { type: 'string', minLength: 1 },
            subtotal: { type: 'number', minimum: 0 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              error: { type: 'string' },
              coupon: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  discountType: { type: 'string' },
                  discountValue: { type: 'number' },
                  discountAmount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply): Promise<CouponResponse> => {
      const { code, subtotal } = request.body;

      try {
        // Fetch coupon from Strapi - case insensitive match on published coupons
        const query = qs.stringify(
          {
            filters: {
              code: { $eqi: code.toUpperCase() },
              isActive: { $eq: true },
            },
            publicationState: 'live', // Only published coupons
          },
          { encodeValuesOnly: true }
        );

        const res = await fetch(`${STRAPI_URL}/api/coupons?${query}`);

        if (!res.ok) {
          fastify.log.error(`Strapi coupon fetch failed: ${res.status}`);
          return { valid: false, error: 'Hiba tortent a kupon ellenorzese soran' };
        }

        const data = await res.json();

        if (!data.data || data.data.length === 0) {
          return { valid: false, error: 'Ervenytelen kuponkod' };
        }

        const coupon: StrapiCoupon = data.data[0];
        const now = new Date();

        // Validate: is active
        if (!coupon.isActive) {
          return { valid: false, error: 'A kupon nem aktiv' };
        }

        // Validate: valid from date
        if (coupon.validFrom && new Date(coupon.validFrom) > now) {
          return { valid: false, error: 'A kupon meg nem ervenyes' };
        }

        // Validate: valid until date
        if (coupon.validUntil && new Date(coupon.validUntil) < now) {
          return { valid: false, error: 'A kupon lejart' };
        }

        // Validate: usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return { valid: false, error: 'A kupon elerte a hasznalati limitet' };
        }

        // Validate: minimum order amount
        if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
          return {
            valid: false,
            error: `Minimum rendelesi osszeg: ${coupon.minimumOrderAmount.toLocaleString('hu-HU')} Ft`,
          };
        }

        // Calculate discount amount
        let discountAmount: number;

        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
          // Apply maximum discount cap if set
          if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
            discountAmount = coupon.maximumDiscount;
          }
        } else {
          // Fixed discount
          discountAmount = coupon.discountValue;
        }

        // Don't allow discount greater than subtotal
        discountAmount = Math.min(discountAmount, subtotal);

        return {
          valid: true,
          coupon: {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
          },
        };
      } catch (error) {
        fastify.log.error(error, 'Coupon validation error');
        return { valid: false, error: 'Hiba tortent a kupon ellenorzese soran' };
      }
    }
  );
}
