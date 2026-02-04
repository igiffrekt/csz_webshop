import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Shipping configuration
const FREE_SHIPPING_THRESHOLD = 50000;
const STANDARD_SHIPPING_FEE = 1990;
const VAT_RATE = 0.27;

// Bank account details
const BANK_ACCOUNT = {
  accountHolder: 'CSZ Tűzvédelem Kft.',
  bankName: 'OTP Bank',
  iban: 'HU42 1176 3103 1234 5678 0000 0000',
  bic: 'OTPVHUHB',
};

interface LineItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  variantName?: string;
  sku: string;
  price: number;
}

interface BankTransferRequest {
  lineItems: LineItem[];
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    companyName?: string;
    vatNumber?: string;
  };
  couponCode?: string;
  poReference?: string;
  userId: number;
}

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CSZ-${year}${month}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Bejelentkezés szükséges' },
        { status: 401 }
      );
    }

    const body: BankTransferRequest = await request.json();
    const { lineItems, shippingAddress, billingAddress, couponCode, poReference, userId } = body;

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Nincsenek termékek a rendelésben' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Szállítási cím szükséges' },
        { status: 400 }
      );
    }

    // Calculate totals server-side (don't trust client values)
    let subtotal = 0;
    const productIds = lineItems.map(item => item.productId);

    // Fetch actual prices from Strapi
    for (const item of lineItems) {
      const productResponse = await fetch(
        `${STRAPI_URL}/api/products/${item.productId}?populate=variants`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
        }
      );

      if (productResponse.ok) {
        const productData = await productResponse.json();
        const product = productData.data;

        if (product) {
          let price = product.basePrice || 0;

          if (item.variantId && product.variants) {
            const variant = product.variants.find(
              (v: { documentId: string }) => v.documentId === item.variantId
            );
            if (variant && variant.price) {
              price = variant.price;
            }
          }

          subtotal += price * item.quantity;
        }
      }
    }

    // Calculate discount
    let discount = 0;
    if (couponCode) {
      const couponResponse = await fetch(
        `${STRAPI_URL}/api/coupons?filters[code][$eq]=${encodeURIComponent(couponCode)}&filters[isActive][$eq]=true`,
        {
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          },
        }
      );

      if (couponResponse.ok) {
        const couponData = await couponResponse.json();
        const coupon = couponData.data?.[0];

        if (coupon) {
          const now = new Date();
          const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
          const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;

          const isValid =
            (!validFrom || now >= validFrom) &&
            (!validUntil || now <= validUntil) &&
            (!coupon.minimumOrderValue || subtotal >= coupon.minimumOrderValue);

          if (isValid) {
            if (coupon.discountType === 'percentage') {
              discount = Math.round(subtotal * (coupon.discountValue / 100));
              if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
              }
            } else {
              discount = coupon.discountValue;
            }
          }
        }
      }
    }

    // Calculate shipping and total
    const afterDiscount = subtotal - discount;
    const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = afterDiscount + shipping;
    const netTotal = Math.round(total / (1 + VAT_RATE));
    const vatAmount = total - netTotal;

    // Generate order number
    const orderNumber = generateOrderNumber();
    const paymentReference = `${orderNumber}`;

    // Create order in Strapi
    const orderData = {
      orderNumber,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending',
      subtotal,
      discount,
      shipping,
      vatAmount,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      poReference,
      lineItems: lineItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      })),
      user: userId,
      couponCode,
    };

    const createOrderResponse = await fetch(`${STRAPI_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify({ data: orderData }),
    });

    if (!createOrderResponse.ok) {
      const errorData = await createOrderResponse.json().catch(() => ({}));
      console.error('Failed to create order:', errorData);
      return NextResponse.json(
        { error: 'Rendelés létrehozása sikertelen' },
        { status: 500 }
      );
    }

    const createdOrder = await createOrderResponse.json();

    return NextResponse.json({
      orderId: createdOrder.data.documentId,
      orderNumber,
      total,
      bankAccount: BANK_ACCOUNT,
      paymentReference,
    });
  } catch (error) {
    console.error('Bank transfer order error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a rendelés létrehozásakor' },
      { status: 500 }
    );
  }
}
