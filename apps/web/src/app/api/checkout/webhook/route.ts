import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/server/stripe'
import { prisma } from '@/lib/prisma'
import { updateOrderStatusInSanity } from '@/lib/sanity-order-sync'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id

      if (orderId && session.payment_status === 'paid') {
        const paidAt = new Date()
        const paymentIntent = session.payment_intent as string
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'paid',
            paymentId: paymentIntent,
            paidAt,
          },
        })
        updateOrderStatusInSanity(orderId, 'paid', paidAt, paymentIntent)
      }
      break
    }

    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id

      if (orderId) {
        const paidAt = new Date()
        const paymentIntent = session.payment_intent as string
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'paid',
            paymentId: paymentIntent,
            paidAt,
          },
        })
        updateOrderStatusInSanity(orderId, 'paid', paidAt, paymentIntent)
      }
      break
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.metadata?.order_id

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'cancelled' },
        })
        updateOrderStatusInSanity(orderId, 'cancelled')
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
