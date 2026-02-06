import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  const { id } = await params

  const quote = await prisma.quoteRequest.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!quote) {
    return NextResponse.json({ error: 'Árajánlat kérés nem található' }, { status: 404 })
  }

  return NextResponse.json({ data: quote })
}
