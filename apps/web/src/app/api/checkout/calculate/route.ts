import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { client } from '@/lib/sanity'
import { calculateVatFromGross } from '@/lib/server/vat'
import { calculateShipping, getFreeShippingThreshold } from '@/lib/server/shipping'

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

interface LineItem {
  productId: string
  variantId?: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const { lineItems, couponCode, shippingCountry } = await request.json()

    if (!lineItems || lineItems.length === 0) {
      return NextResponse.json({ error: 'Nincsenek termékek a kosárban' }, { status: 400 })
    }

    // Fetch product prices from Sanity
    const productIds = [...new Set(lineItems.map((item: LineItem) => item.productId))]
    const products = await client.fetch(PRODUCT_PRICES_QUERY, { ids: productIds })

    const productMap = new Map<string, any>()
    for (const product of products || []) {
      productMap.set(product._id, product)
    }

    let subtotal = 0
    let totalWeight = 0

    for (const item of lineItems) {
      const product = productMap.get(item.productId)
      if (!product) continue

      let price = product.basePrice || 0
      let weight = product.weight || 0

      if (item.variantId && product.variants) {
        const variant = product.variants.find((v: any) => v._id === item.variantId)
        if (variant) {
          price = variant.price || price
          weight = variant.weight || weight
        }
      }

      subtotal += price * item.quantity
      totalWeight += weight * item.quantity
    }

    // Validate and apply coupon from Prisma
    let discount = 0
    let couponApplied = false
    let couponError: string | undefined

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: { equals: couponCode, mode: 'insensitive' },
          isActive: true,
        },
      })

      if (coupon) {
        const now = new Date()
        if (coupon.validFrom && now < coupon.validFrom) {
          couponError = 'A kupon még nem érvényes'
        } else if (coupon.validUntil && now > coupon.validUntil) {
          couponError = 'A kupon már lejárt'
        } else if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
          couponError = `Minimum rendelési érték: ${coupon.minimumOrderAmount.toLocaleString('hu-HU')} Ft`
        } else {
          if (coupon.discountType === 'percentage') {
            discount = Math.round(subtotal * (coupon.discountValue / 100))
            if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
              discount = coupon.maximumDiscount
            }
          } else {
            discount = coupon.discountValue
          }
          discount = Math.min(discount, subtotal)
          couponApplied = true
        }
      } else {
        couponError = 'Érvénytelen kuponkód'
      }
    }

    const afterDiscount = subtotal - discount
    const shipping = calculateShipping(totalWeight, afterDiscount)
    const total = afterDiscount + shipping
    const { vatAmount, netPrice: netTotal } = calculateVatFromGross(total)

    return NextResponse.json({
      subtotal,
      discount,
      shipping,
      netTotal,
      vatAmount,
      total,
      freeShippingThreshold: getFreeShippingThreshold(),
      couponApplied,
      couponError,
    })
  } catch (error) {
    console.error('Calculate totals error:', error)
    return NextResponse.json({ error: 'Hiba történt a számítás során' }, { status: 500 })
  }
}
