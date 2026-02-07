import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateRequestNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AK-${year}${month}-${random}`
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const quotes = await prisma.quoteRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: quotes })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Bejelentkezés szükséges' }, { status: 401 })
  }

  const body = await request.json()

  const quote = await prisma.quoteRequest.create({
    data: {
      requestNumber: generateRequestNumber(),
      status: 'pending',
      userId: session.user.id,
      items: body.items || [],
      deliveryNotes: body.deliveryNotes,
      companyName: body.companyName,
      contactEmail: body.contactEmail || session.user.email!,
      contactPhone: body.contactPhone,
    },
  })

  return NextResponse.json({ data: quote })
}
