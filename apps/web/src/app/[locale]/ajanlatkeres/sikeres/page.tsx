import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getQuoteRequest } from '@/lib/quote-api';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { CheckCircle, FileText, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Árajánlat kérés elküldve | Dunamenti CSZ Webshop',
  description: 'Az árajánlat kérését megkaptuk',
};

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function QuoteSuccessPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect('/hu/auth/bejelentkezes');
  }

  const { id } = await searchParams;

  if (!id) {
    redirect('/hu/ajanlatkeres');
  }

  const { data: quoteRequest } = await getQuoteRequest(id);
  const items: any[] = quoteRequest
    ? typeof quoteRequest.items === 'string' ? JSON.parse(quoteRequest.items) : (quoteRequest.items || [])
    : [];

  return (
    <main className="site-container py-8 max-w-2xl text-center">
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

        {items.length > 0 && (
          <div className="border rounded-lg p-4 mb-8 text-left">
            <h2 className="font-semibold mb-3">Kért termékek:</h2>
            <ul className="space-y-2">
              {items.map((item: any, index: number) => (
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
            <Link href="/fiok/ajanlatkeres">
              <FileText className="mr-2 h-4 w-4" />
              Árajánlat kéréseim
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Vissza a főoldalra
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
