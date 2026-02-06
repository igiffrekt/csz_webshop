'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { QuoteRequest, CreateQuoteRequestInput } from '@csz/types'

function generateRequestNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AK-${year}${month}-${random}`
}

export async function createQuoteRequest(
  input: CreateQuoteRequestInput
): Promise<{ data: QuoteRequest | null; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { data: null, error: 'Bejelentkezés szükséges' }
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        requestNumber: generateRequestNumber(),
        status: 'pending',
        userId: session.user.id,
        items: input.items as any,
        deliveryNotes: input.deliveryNotes,
        companyName: input.companyName,
        contactEmail: input.contactEmail || session.user.email!,
        contactPhone: input.contactPhone,
      },
    })

    return { data: quote as any }
  } catch (error) {
    if (error instanceof Error && error.message === 'Bejelentkezés szükséges') {
      return { data: null, error: error.message }
    }
    return { data: null, error: 'Kapcsolódási hiba' }
  }
}

export async function getQuoteRequests(): Promise<{ data: QuoteRequest[]; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { data: [], error: 'Bejelentkezés szükséges' }
    }

    const quotes = await prisma.quoteRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return { data: quotes as any }
  } catch {
    return { data: [], error: 'Kapcsolódási hiba' }
  }
}

export async function getQuoteRequest(
  id: string
): Promise<{ data: QuoteRequest | null; error?: string }> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { data: null, error: 'Bejelentkezés szükséges' }
    }

    const quote = await prisma.quoteRequest.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!quote) {
      return { data: null, error: 'Árajánlat kérés nem található' }
    }

    return { data: quote as any }
  } catch {
    return { data: null, error: 'Kapcsolódási hiba' }
  }
}
