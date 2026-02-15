import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'id szükséges' }, { status: 400 })
  }

  // Clear all defaults
  await prisma.shippingAddress.updateMany({
    where: { userId: session.user.id, isDefault: true },
    data: { isDefault: false },
  })

  // Set new default
  await prisma.shippingAddress.update({
    where: { id, userId: session.user.id },
    data: { isDefault: true },
  })

  return NextResponse.json({ success: true })
}
