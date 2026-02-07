import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getAddresses } from '@/lib/address-api';
import { CheckoutClient } from './CheckoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pénztár | CSZ Tűzvédelmi Webshop',
  description: 'Rendelése befejezése',
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/hu/auth/bejelentkezes?redirect=/hu/penztar");
  }

  const { data: addresses, error } = await getAddresses();

  if (error) {
    console.error('Failed to fetch addresses:', error);
  }

  return (
    <main className="site-container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">Pénztár</h1>
      <CheckoutClient
        initialAddresses={addresses || []}
        userId={session.user.id}
      />
    </main>
  );
}
