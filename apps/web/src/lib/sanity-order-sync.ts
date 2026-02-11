import { writeClient } from '@/lib/sanity'
import { prisma } from '@/lib/prisma'

interface LineItem {
  productId: string
  variantId?: string
  name: string
  variantName?: string
  sku: string
  price: number
  quantity: number
  total: number
}

interface Address {
  recipientName?: string
  street?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
  companyName?: string
  vatNumber?: string
}

function mapAddress(addr: Address | null | undefined) {
  if (!addr) return undefined
  return {
    _type: 'orderAddress' as const,
    recipientName: addr.recipientName || '',
    street: addr.street || '',
    city: addr.city || '',
    postalCode: addr.postalCode || '',
    country: addr.country || '',
    phone: addr.phone || '',
    companyName: addr.companyName || '',
    vatNumber: addr.vatNumber || '',
  }
}

export async function syncOrderToSanity(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    })
    if (!order) return

    const lineItems = (order.lineItems as unknown as LineItem[]) || []
    const shippingAddr = order.shippingAddress as unknown as Address | null
    const billingAddr = order.billingAddress as unknown as Address | null

    await writeClient.createOrReplace({
      _type: 'order',
      _id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerEmail: order.user.email,
      customerName: [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.user.email,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      vatAmount: order.vatAmount,
      total: order.total,
      lineItems: lineItems.map((item, i) => ({
        _type: 'orderLineItem',
        _key: `item-${i}`,
        productId: item.productId,
        variantId: item.variantId || '',
        name: item.name,
        variantName: item.variantName || '',
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
      })),
      shippingAddress: mapAddress(shippingAddr),
      billingAddress: mapAddress(billingAddr),
      couponCode: order.couponCode || '',
      paymentMethod: order.paymentMethod || '',
      paymentId: order.paymentId || '',
      stripeSessionId: order.stripeSessionId || '',
      paidAt: order.paidAt?.toISOString() || undefined,
      poReference: order.poReference || '',
      notes: '',
    })
  } catch (error) {
    console.error('Failed to sync order to Sanity:', error)
  }
}

export async function updateOrderStatusInSanity(
  orderId: string,
  status: string,
  paidAt?: Date,
  paymentId?: string,
) {
  try {
    const patch: Record<string, unknown> = { status }
    if (paidAt) patch.paidAt = paidAt.toISOString()
    if (paymentId) patch.paymentId = paymentId

    await writeClient.patch(orderId).set(patch).commit()
  } catch (error) {
    console.error('Failed to update order status in Sanity:', error)
  }
}
