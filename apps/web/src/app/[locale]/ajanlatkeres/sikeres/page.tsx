import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/dal';
import { getQuoteRequest } from '@/lib/quote-api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, FileText, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Árajánlat kérés elküldve | CSZ Tűzvédelmi Webshop',
  description: 'Az árajánlat kérését megkaptuk',
};

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function QuoteSuccessPage({ searchParams }: Props) {
  await requireAuth();

  const { id } = await searchParams;

  if (!id) {
    redirect('/hu/ajanlatkeres');
  }

  const { data: quoteRequest } = await getQuoteRequest(id);

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl text-center">
      <div className="py-12">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Köszönjük az árajánlat kérését!</h1>

        {quoteRequest && (
          <p className="text-lg text-muted-foreground mb-2">
            Kérés azonosító: <span className="font-mono font-medium">{quoteRequest.requestNumber}</span>
          </p>
        )}

        <p className="text-muted-foreground mb-8">
          Munkatársunk hamarosan felveszi Önnel a kapcsolatot a megadott elérhetőségeken.
          Az árajánlat kéréseit megtekintheti a fiókjában.
        </p>

        {quoteRequest && quoteRequest.items.length > 0 && (
          <div className="border rounded-lg p-4 mb-8 text-left">
            <h2 className="font-semibold mb-3">Kért termékek:</h2>
            <ul className="space-y-2">
              {quoteRequest.items.map((item, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span>{item.productName}</span>
                  <span className="text-muted-foreground">{item.quantity} db</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/hu/fiok/ajanlatkeres">
              <FileText className="mr-2 h-4 w-4" />
              Árajánlat kéréseim
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/hu">
              <Home className="mr-2 h-4 w-4" />
              Vissza a főoldalra
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
