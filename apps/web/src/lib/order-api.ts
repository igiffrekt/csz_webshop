import 'server-only';
import { getSession } from './auth/session';
import type { Order } from '@csz/types';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

/**
 * Get a single order by documentId
 * Requires authenticated user who owns the order
 */
export async function getOrder(documentId: string): Promise<ApiResponse<Order>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: 'Nincs bejelentkezve' };
  }

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/orders/${documentId}`,
      {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return { data: null, error: 'Rendeles nem talalhato' };
      }
      return { data: null, error: 'Rendeles betoltese sikertelen' };
    }

    const json = await res.json();
    return { data: json.data };
  } catch {
    return { data: null, error: 'Hiba tortent' };
  }
}

/**
 * Get all orders for the current user
 */
export async function getOrders(): Promise<ApiResponse<Order[]>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: 'Nincs bejelentkezve' };
  }

  try {
    // Strapi needs a custom controller to filter by user
    // For now, fetch all and let controller filter
    const res = await fetch(
      `${STRAPI_URL}/api/orders?sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return { data: null, error: 'Rendelesek betoltese sikertelen' };
    }

    const json = await res.json();
    return { data: json.data || [] };
  } catch {
    return { data: null, error: 'Hiba tortent' };
  }
}

/**
 * Get order by Stripe session ID
 * Used on success page to find order from redirect
 */
export async function getOrderByStripeSession(
  sessionId: string
): Promise<ApiResponse<Order>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: 'Nincs bejelentkezve' };
  }

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/orders?filters[stripeSessionId][$eq]=${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return { data: null, error: 'Rendeles nem talalhato' };
    }

    const json = await res.json();
    const orders = json.data || [];

    if (orders.length === 0) {
      return { data: null, error: 'Rendeles nem talalhato' };
    }

    return { data: orders[0] };
  } catch {
    return { data: null, error: 'Hiba tortent' };
  }
}

/**
 * Format order status in Hungarian
 */
export function formatOrderStatus(status: string): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  const statuses: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Fizetesre var', variant: 'outline' },
    paid: { label: 'Fizetve', variant: 'secondary' },
    processing: { label: 'Feldolgozas alatt', variant: 'secondary' },
    shipped: { label: 'Szallitas alatt', variant: 'default' },
    delivered: { label: 'Kiszallitva', variant: 'default' },
    cancelled: { label: 'Lemondva', variant: 'destructive' },
    refunded: { label: 'Visszafizetve', variant: 'destructive' },
  };

  return statuses[status] || { label: status, variant: 'outline' };
}
