import 'server-only'
import { auth } from './auth'
import type { ShippingAddress } from '@csz/types'

interface AddressInput {
  label: string
  recipientName: string
  street: string
  city: string
  postalCode: string
  country?: string
  phone?: string
  isDefault?: boolean
}

interface ApiResponse<T> {
  data: T | null
  error?: string
}

export async function getAddresses(): Promise<ApiResponse<ShippingAddress[]>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { data: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const { prisma } = await import('./prisma')
    const addresses = await prisma.shippingAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return { data: addresses as any }
  } catch {
    return { data: null, error: 'Hiba történt' }
  }
}

export async function createAddress(
  input: AddressInput
): Promise<ApiResponse<ShippingAddress>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { data: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const { prisma } = await import('./prisma')

    if (input.isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.shippingAddress.create({
      data: {
        ...input,
        country: input.country || 'Magyarország',
        isDefault: input.isDefault || false,
        userId: session.user.id,
      },
    })

    return { data: address as any }
  } catch {
    return { data: null, error: 'Cím létrehozása sikertelen' }
  }
}

export async function updateAddress(
  id: string,
  input: Partial<AddressInput>
): Promise<ApiResponse<ShippingAddress>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { data: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const { prisma } = await import('./prisma')

    if (input.isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.shippingAddress.update({
      where: { id },
      data: input,
    })

    return { data: address as any }
  } catch {
    return { data: null, error: 'Cím frissítése sikertelen' }
  }
}

export async function deleteAddress(
  id: string
): Promise<ApiResponse<boolean>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { data: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const { prisma } = await import('./prisma')
    await prisma.shippingAddress.delete({ where: { id } })
    return { data: true }
  } catch {
    return { data: null, error: 'Cím törlése sikertelen' }
  }
}
