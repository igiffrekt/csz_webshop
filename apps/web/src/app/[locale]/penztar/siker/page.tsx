import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getOrderByStripeSession } from '@/lib/order-api';
import { OrderConfirmation } from './OrderConfirmation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sikeres rendelés | Dunamenti CSZ Webshop',
  description: 'Köszönjük a rendelését!',
};

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect('/hu/auth/bejelentkezes');
  }

  const { session_id } = await searchParams;

  if (!session_id) {
    redirect('/hu/penztar');
  }

  // Find order by Stripe session ID
  const { data: order, error } = await getOrderByStripeSession(session_id);

  if (error || !order) {
    // Order not found - might be processing, show generic success
    return (
      <main className="site-container py-8 max-w-2xl text-center">
        <div className="py-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Köszönjük a rendelését!</h1>
          <p className="text-muted-foreground mb-6">
            A rendelését feldolgozzuk. Hamarosan email értesítést küldünk a részletekkel.
          </p>
          <a
            href="/hu/fiok/rendelesek"
            className="text-primary hover:underline"
          >
            Rendeléseim megtekintése
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="site-container py-8 max-w-2xl">
      <OrderConfirmation order={order} />
    </main>
  );
}
