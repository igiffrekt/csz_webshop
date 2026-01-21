import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getQuoteRequests } from '@/lib/quote-api';
import { QuoteCard } from '@/components/quotes';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

export const metadata = {
  title: 'Árajánlat kérések - CSZ Tűzvédelem',
};

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function QuoteHistoryPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getSession();

  if (!session?.jwt) {
    redirect(`/${locale}/auth/bejelentkezes?redirect=/fiok/ajanlatkeres`);
  }

  const { data: quotes, error } = await getQuoteRequests(session.jwt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Árajánlat kérések</h1>
          <p className="text-muted-foreground">
            Korábbi árajánlat kéréseinek áttekintése
          </p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/ajanlatkeres`}>
            <Plus className="mr-2 h-4 w-4" />
            Új árajánlat kérés
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {quotes && quotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Nincs árajánlat kérés</h3>
          <p className="mt-2 text-muted-foreground">
            Még nem küldött be árajánlat kérést.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${locale}/ajanlatkeres`}>
              Árajánlat kérés indítása
            </Link>
          </Button>
        </div>
      )}

      {quotes && quotes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {quotes.map((quote) => (
            <QuoteCard key={quote.documentId} quote={quote} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
