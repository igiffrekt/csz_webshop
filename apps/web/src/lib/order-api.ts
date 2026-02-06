import 'server-only'
import { auth } from './auth'

interface ApiResponse<T> {
  data: T | null
  error?: string
}

export async function getOrder(id: string): Promise<ApiResponse<any>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { data: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const { prisma } = await import('./prisma')
    const order = await prisma.order.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!order) {
      return { data: null, error: 'Rendelés nem található' }
    }

    return { data: order }
  } catch {
    return { data: null, error: 'Hiba történt' }
  }
}

export async function getOrders(): Promise<ApiResponse<any[]>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { data: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const { prisma } = await import('./prisma')
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return { data: orders }
  } catch {
    return { data: null, error: 'Hiba történt' }
  }
}

export async function getOrderByStripeSession(
  sessionId: string
): Promise<ApiResponse<any>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { data: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const { prisma } = await import('./prisma')
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: sessionId, userId: session.user.id },
    })

    if (!order) {
      return { data: null, error: 'Rendelés nem található' }
    }

    return { data: order }
  } catch {
    return { data: null, error: 'Hiba történt' }
  }
}
