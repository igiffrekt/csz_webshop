import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Get the Stripe client singleton.
 * Throws if STRIPE_SECRET_KEY is not configured.
 * Lazy initialization allows API to start without Stripe credentials
 * (other routes will still work).
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

// Export for backward compatibility and convenience
export const stripe = {
  get webhooks() {
    return getStripe().webhooks;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get paymentIntents() {
    return getStripe().paymentIntents;
  },
};

export type { Stripe };
