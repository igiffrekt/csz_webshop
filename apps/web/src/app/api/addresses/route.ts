import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const addresses = await prisma.shippingAddress.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ data: addresses })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const body = await request.json()

  // If setting as default, clear other defaults
  if (body.isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await prisma.shippingAddress.create({
    data: {
      label: body.label,
      recipientName: body.recipientName,
      street: body.street,
      city: body.city,
      postalCode: body.postalCode,
      country: body.country || 'Magyarország',
      phone: body.phone,
      isDefault: body.isDefault || false,
      userId: session.user.id,
    },
  })

  return NextResponse.json(address)
}

export async function PUT(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...data } = body

  if (!id) {
    return NextResponse.json({ error: 'id szükséges' }, { status: 400 })
  }

  // Verify ownership
  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Cím nem található' }, { status: 404 })
  }

  if (data.isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.shippingAddress.update({
    where: { id },
    data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id szükséges' }, { status: 400 })
  }

  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Cím nem található' }, { status: 404 })
  }

  await prisma.shippingAddress.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
