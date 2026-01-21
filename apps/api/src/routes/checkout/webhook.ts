import type { FastifyPluginAsync } from 'fastify';
import { stripe } from '../../lib/stripe.js';
import type Stripe from 'stripe';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

interface OrderUpdatePayload {
  data: {
    status: string;
    paymentId?: string;
    paidAt?: string;
  };
}

async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentData?: { paymentId: string; paidAt: string }
): Promise<void> {
  const payload: OrderUpdatePayload = {
    data: {
      status,
      ...paymentData,
    },
  };

  const response = await fetch(`${STRAPI_URL}/api/orders/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to update order ${orderId}: ${response.statusText}`);
  }
}

export const webhookRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /webhook/stripe - Stripe webhook handler
  fastify.post<{ Body: string }>('/stripe', {
    config: {
      rawBody: true,
    },
  }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      fastify.log.error('STRIPE_WEBHOOK_SECRET not configured');
      return reply.status(500).send({ error: 'Webhook not configured' });
    }

    let event: Stripe.Event;

    try {
      // CRITICAL: Use rawBody for signature verification
      event = stripe.webhooks.constructEvent(
        request.rawBody as string,
        sig,
        webhookSecret
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      fastify.log.error({ err }, 'Webhook signature verification failed');
      return reply.status(400).send({ error: `Webhook Error: ${message}` });
    }

    fastify.log.info({ type: event.type, id: event.id }, 'Received Stripe event');

    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (!orderId) {
          fastify.log.warn({ sessionId: session.id }, 'No order_id in session metadata');
          break;
        }

        // Check payment status
        if (session.payment_status === 'paid') {
          await updateOrderStatus(orderId, 'paid', {
            paymentId: session.payment_intent as string,
            paidAt: new Date().toISOString(),
          });
          fastify.log.info({ orderId }, 'Order marked as paid');
        } else if (session.payment_status === 'unpaid') {
          // Bank transfer - waiting for payment
          fastify.log.info({ orderId }, 'Order awaiting bank transfer payment');
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        // Bank transfer completed
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await updateOrderStatus(orderId, 'paid', {
            paymentId: session.payment_intent as string,
            paidAt: new Date().toISOString(),
          });
          fastify.log.info({ orderId }, 'Bank transfer payment confirmed');
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        // Bank transfer failed/expired
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await updateOrderStatus(orderId, 'cancelled');
          fastify.log.info({ orderId }, 'Order cancelled due to failed payment');
        }
        break;
      }

      default:
        fastify.log.info({ type: event.type }, 'Unhandled event type');
    }

    // Always return 200 to acknowledge receipt
    return reply.status(200).send({ received: true });
  });
};
