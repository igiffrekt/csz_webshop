import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

// Shipping configuration
const FREE_SHIPPING_THRESHOLD = 50000; // Free shipping above 50,000 Ft
const STANDARD_SHIPPING_FEE = 1990; // Standard shipping fee
const VAT_RATE = 0.27; // Hungarian VAT rate (27%)

interface LineItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface CalculateRequest {
  lineItems: LineItem[];
  couponCode?: string;
  shippingCountry: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json();
    const { lineItems, couponCode, shippingCountry } = body;

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Nincsenek termékek a kosárban' },
        { status: 400 }
      );
    }

    // Fetch product prices from Strapi to ensure accuracy
    let subtotal = 0;
    const productIds = lineItems.map(item => item.productId);

    // Fetch products
    const productsResponse = await fetch(
      `${STRAPI_URL}/api/products?filters[documentId][$in]=${productIds.join(',')}&populate=variants`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
      }
    );

    if (!productsResponse.ok) {
      console.error('Failed to fetch products:', productsResponse.status);
      return NextResponse.json(
        { error: 'Termékek lekérése sikertelen' },
        { status: 500 }
      );
    }

    const productsData = await productsResponse.json();
    const products = productsData.data || [];

    // Create a map of products by documentId
    const productMap = new Map();
    for (const product of products) {
      productMap.set(product.documentId, product);
    }

    // Calculate subtotal from actual product prices
    for (const item of lineItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        // Try fetching individual product if not in batch
        const singleResponse = await fetch(
          `${STRAPI_URL}/api/products/${item.productId}?populate=variants`,
          {
            headers: {
              Authorization: `Bearer ${STRAPI_TOKEN}`,
            },
          }
        );

        if (singleResponse.ok) {
          const singleData = await singleResponse.json();
          if (singleData.data) {
            productMap.set(item.productId, singleData.data);
          }
        }
      }

      const foundProduct = productMap.get(item.productId);
      if (!foundProduct) {
        console.warn(`Product not found: ${item.productId}`);
        continue;
      }

      let price = foundProduct.basePrice || 0;

      // Check for variant price
      if (item.variantId && foundProduct.variants) {
        const variant = foundProduct.variants.find(
          (v: { documentId: string }) => v.documentId === item.variantId
        );
        if (variant && variant.price) {
          price = variant.price;
        }
      }

      subtotal += price * item.quantity;
    }

    // Calculate discount (coupon)
    let discount = 0;
    let couponApplied = false;
    let couponError: string | undefined;

    if (couponCode) {
      // Fetch coupon from Strapi
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
          // Check validity dates
          const now = new Date();
          const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
          const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;

          if (validFrom && now < validFrom) {
            couponError = 'A kupon még nem érvényes';
          } else if (validUntil && now > validUntil) {
            couponError = 'A kupon már lejárt';
          } else if (coupon.minimumOrderValue && subtotal < coupon.minimumOrderValue) {
            couponError = `Minimum rendelési érték: ${coupon.minimumOrderValue.toLocaleString('hu-HU')} Ft`;
          } else {
            // Apply discount
            if (coupon.discountType === 'percentage') {
              discount = Math.round(subtotal * (coupon.discountValue / 100));
              // Apply max discount if set
              if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
              }
            } else {
              discount = coupon.discountValue;
            }
            couponApplied = true;
          }
        } else {
          couponError = 'Érvénytelen kuponkód';
        }
      }
    }

    // Calculate shipping
    const afterDiscount = subtotal - discount;
    let shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

    // For non-Hungarian shipping, apply higher fee (if needed in future)
    if (shippingCountry && !['Magyarország', 'Magyarorszag', 'Hungary', 'HU'].includes(shippingCountry)) {
      shipping = Math.max(shipping, 4990); // International shipping fee
    }

    // Calculate VAT
    // In Hungary, prices are typically displayed including VAT
    // So we calculate the VAT portion from the total
    const netTotal = Math.round((afterDiscount + shipping) / (1 + VAT_RATE));
    const vatAmount = (afterDiscount + shipping) - netTotal;
    const total = afterDiscount + shipping;

    return NextResponse.json({
      subtotal,
      discount,
      shipping,
      netTotal,
      vatAmount,
      total,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      couponApplied,
      couponError,
    });
  } catch (error) {
    console.error('Calculate totals error:', error);
    return NextResponse.json(
      { error: 'Hiba történt a számítás során' },
      { status: 500 }
    );
  }
}
