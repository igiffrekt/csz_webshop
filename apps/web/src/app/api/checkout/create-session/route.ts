import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { client } from '@/lib/sanity'
import { getStripe } from '@/lib/server/stripe'
import { calculateVatFromGross } from '@/lib/server/vat'
import { calculateShipping } from '@/lib/server/shipping'

const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const PRODUCT_PRICES_QUERY = `*[_type == "product" && _id in $ids] {
  _id,
  basePrice,
  weight,
  "variants": variants[]->{
    _id,
    price,
    weight
  }
}`

function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CSZ-${year}-${timestamp}${random}`
}

interface LineItemInput {
  productId: string
  variantId?: string
  quantity: number
  name: string
  variantName?: string
  sku: string
  price: number
}

export async function POST(request: NextRequest) {
  try {
    const { lineItems, shippingAddress, billingAddress, couponCode, poReference, userId } = await request.json()

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json({ error: 'A kosár üres' }, { status: 400 })
    }
    if (!shippingAddress) {
      return NextResponse.json({ error: 'Szállítási cím szükséges' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'Felhasználó azonosító szükséges' }, { status: 400 })
    }

    const stripe = getStripe()

    // Fetch current prices from Sanity
    const productIds = [...new Set(lineItems.map((li: LineItemInput) => li.productId))]
    const products = await client.fetch(PRODUCT_PRICES_QUERY, { ids: productIds })

    const priceMap = new Map<string, { price: number; weight: number }>()
    for (const product of products || []) {
      priceMap.set(product._id, { price: product.basePrice, weight: product.weight || 0 })
      if (product.variants) {
        for (const variant of product.variants) {
          priceMap.set(variant._id, { price: variant.price, weight: variant.weight || 0 })
        }
      }
    }

    let subtotal = 0
    let totalWeight = 0
    const verifiedLineItems: Array<{
      productId: string; variantId?: string; name: string; variantName?: string
      sku: string; price: number; quantity: number; total: number
    }> = []

    for (const item of lineItems) {
      const key = item.variantId || item.productId
      const priceInfo = priceMap.get(key)
      if (!priceInfo) {
        return NextResponse.json({ error: `Termék nem található: ${item.name}` }, { status: 400 })
      }

      subtotal += priceInfo.price * item.quantity
      totalWeight += priceInfo.weight * item.quantity

      verifiedLineItems.push({
        productId: item.productId, variantId: item.variantId,
        name: item.name, variantName: item.variantName, sku: item.sku,
        price: priceInfo.price, quantity: item.quantity,
        total: priceInfo.price * item.quantity,
      })
    }

    // Apply coupon from Prisma
    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: { equals: couponCode, mode: 'insensitive' }, isActive: true },
      })
      if (coupon) {
        const now = new Date()
        const isValid =
          (!coupon.validFrom || now >= coupon.validFrom) &&
          (!coupon.validUntil || now <= coupon.validUntil) &&
          (!coupon.minimumOrderAmount || subtotal >= coupon.minimumOrderAmount)
        if (isValid) {
          if (coupon.discountType === 'percentage') {
            discount = Math.round(subtotal * (coupon.discountValue / 100))
            if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount)
          } else {
            discount = coupon.discountValue
          }
          discount = Math.min(discount, subtotal)
        }
      }
    }

    const discountedSubtotal = subtotal - discount
    const shipping = calculateShipping(totalWeight, discountedSubtotal)
    const total = discountedSubtotal + shipping
    const { vatAmount } = calculateVatFromGross(total)
    const orderNumber = generateOrderNumber()

    // Create order in Prisma FIRST
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'pending',
        userId,
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
      },
    })

    // Create Stripe line items (HUF * 100)
    const HUF_MULTIPLIER = 100
    const stripeLineItems = verifiedLineItems.map((item) => ({
      price_data: {
        currency: 'huf',
        product_data: {
          name: item.variantName ? `${item.name} - ${item.variantName}` : item.name,
        },
        unit_amount: item.price * HUF_MULTIPLIER,
      },
      quantity: item.quantity,
    }))

    if (shipping > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'huf',
          product_data: { name: 'Szállítási díj' },
          unit_amount: shipping * HUF_MULTIPLIER,
        },
        quantity: 1,
      })
    }

    let discounts: Array<{ coupon: string }> | undefined
    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: discount * HUF_MULTIPLIER,
        currency: 'huf',
        duration: 'once',
        name: couponCode || 'Kedvezmény',
      })
      discounts = [{ coupon: stripeCoupon.id }]
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      currency: 'huf',
      locale: 'hu',
      line_items: stripeLineItems,
      discounts,
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        po_reference: poReference || '',
      },
      return_url: `${FRONTEND_URL}/hu/penztar/siker?session_id={CHECKOUT_SESSION_ID}`,
    })

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({
      clientSecret: session.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json({ error: 'Hiba történt a fizetés indításakor' }, { status: 500 })
  }
}
