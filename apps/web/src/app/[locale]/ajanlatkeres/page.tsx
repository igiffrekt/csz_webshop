import { requireAuth } from '@/lib/auth/dal';
import { getCurrentUserProfile } from '@/lib/auth/actions';
import { QuoteRequestForm } from './QuoteRequestForm';
import { FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Árajánlat kérés | CSZ Tűzvédelmi Webshop',
  description: 'Kérjen árajánlatot nagyobb mennyiségű rendeléshez',
};

export default async function QuoteRequestPage() {
  await requireAuth("/hu/ajanlatkeres");
  const { user: profile } = await getCurrentUserProfile();

  return (
    <main className="site-container py-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Árajánlat kérés</h1>
        <p className="text-muted-foreground">
          Nagyobb mennyiségű rendeléshez kérjen egyedi árajánlatot.
          Munkatársunk hamarosan felveszi Önnel a kapcsolatot.
        </p>
      </div>

      <div className="border rounded-lg p-6">
        <QuoteRequestForm
          userEmail={profile?.email || ''}
          companyName={profile?.companyName}
          phone={profile?.phone}
        />
      </div>
    </main>
  );
}
