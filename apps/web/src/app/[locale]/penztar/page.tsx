import { requireAuth } from '@/lib/auth/dal';
import { getAddresses } from '@/lib/address-api';
import { CheckoutClient } from './CheckoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pénztár | CSZ Tűzvédelmi Webshop',
  description: 'Rendelése befejezése',
};

export default async function CheckoutPage() {
  // Require authentication - redirects to login if not authenticated
  const session = await requireAuth("/hu/penztar");

  // Fetch saved addresses
  const { data: addresses, error } = await getAddresses();

  if (error) {
    // Handle error - could redirect or show message
    console.error('Failed to fetch addresses:', error);
  }

  return (
    <main className="site-container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Pénztár</h1>
      <CheckoutClient
        initialAddresses={addresses || []}
        userId={session.userId}
      />
    </main>
  );
}
