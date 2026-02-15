import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const addressSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  recipientName: z.string().min(1).max(200),
  street: z.string().min(1).max(500),
  city: z.string().min(1).max(200),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100).optional(),
  phone: z.string().max(50).optional(),
  isDefault: z.boolean().optional(),
})

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

  let validated
  try {
    const body = await request.json()
    validated = addressSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Érvénytelen adatok', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 })
  }

  // If setting as default, clear other defaults
  if (validated.isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    })
  }

  const address = await prisma.shippingAddress.create({
    data: {
      label: validated.label ?? '',
      recipientName: validated.recipientName,
      street: validated.street,
      city: validated.city,
      postalCode: validated.postalCode,
      country: validated.country || 'Magyarország',
      phone: validated.phone,
      isDefault: validated.isDefault || false,
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

  let id: string
  let data
  try {
    const body = await request.json()
    id = body.id
    const { id: _id, ...raw } = body
    data = addressSchema.partial().parse(raw)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Érvénytelen adatok', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 })
  }

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
