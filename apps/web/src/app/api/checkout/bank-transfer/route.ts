import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { client } from '@/lib/sanity'
import { calculateVatFromGross } from '@/lib/server/vat'
import { calculateShipping } from '@/lib/server/shipping'
import { syncOrderToSanity } from '@/lib/sanity-order-sync'

const BANK_ACCOUNT = {
  accountHolder: 'CSZ Tűzvédelem Kft.',
  bankName: 'OTP Bank',
  iban: 'HU42 1176 3103 1234 5678 0000 0000',
  bic: 'OTPVHUHB',
}

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
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CSZ-${year}${month}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Bejelentkezés szükséges' }, { status: 401 })
    }

    const { lineItems, shippingAddress, billingAddress, couponCode, poReference } = await request.json()

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json({ error: 'Nincsenek termékek a rendelésben' }, { status: 400 })
    }
    if (!shippingAddress) {
      return NextResponse.json({ error: 'Szállítási cím szükséges' }, { status: 400 })
    }

    // Fetch prices from Sanity
    const productIds = [...new Set(lineItems.map((item: any) => item.productId))]
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
    for (const item of lineItems) {
      const key = item.variantId || item.productId
      const priceInfo = priceMap.get(key)
      if (priceInfo) {
        subtotal += priceInfo.price * item.quantity
        totalWeight += priceInfo.weight * item.quantity
      }
    }

    // Coupon from Prisma
    let discount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: { equals: couponCode }, isActive: true },
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

    const afterDiscount = subtotal - discount
    const shipping = calculateShipping(totalWeight, afterDiscount)
    const total = afterDiscount + shipping
    const { vatAmount } = calculateVatFromGross(total)

    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'pending',
        userId: session.user.id,
        paymentMethod: 'bank_transfer',
        subtotal,
        discount,
        shipping,
        vatAmount,
        total,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        lineItems: lineItems.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          variantName: item.variantName,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        couponCode: discount > 0 ? couponCode : undefined,
        couponDiscount: discount > 0 ? discount : undefined,
        poReference,
      },
    })

    syncOrderToSanity(order.id)

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      total,
      bankAccount: BANK_ACCOUNT,
      paymentReference: orderNumber,
    })
  } catch (error) {
    console.error('Bank transfer order error:', error)
    return NextResponse.json({ error: 'Hiba történt a rendelés létrehozásakor' }, { status: 500 })
  }
}
