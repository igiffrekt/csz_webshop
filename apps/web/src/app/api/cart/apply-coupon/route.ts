import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()

    if (!code || subtotal === undefined) {
      return NextResponse.json({ valid: false, error: 'Kuponkód és részösszeg szükséges' }, { status: 400 })
    }

    // Case-insensitive lookup
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: { equals: code },
        isActive: true,
      },
    })

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Érvénytelen kuponkód' })
    }

    const now = new Date()

    if (coupon.validFrom && coupon.validFrom > now) {
      return NextResponse.json({ valid: false, error: 'A kupon még nem érvényes' })
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({ valid: false, error: 'A kupon lejárt' })
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'A kupon elérte a használati limitet' })
    }

    if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum rendelési összeg: ${coupon.minimumOrderAmount.toLocaleString('hu-HU')} Ft`,
      })
    }

    let discountAmount: number

    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (coupon.discountValue / 100))
      if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
        discountAmount = coupon.maximumDiscount
      }
    } else {
      discountAmount = coupon.discountValue
    }

    discountAmount = Math.min(discountAmount, subtotal)

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    })
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ valid: false, error: 'Hiba történt a kupon ellenőrzése során' }, { status: 500 })
  }
}
