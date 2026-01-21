import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import type { QuoteRequest } from '@csz/types';

interface QuoteCardProps {
  quote: QuoteRequest;
  locale: string;
}

export function QuoteCard({ quote, locale }: QuoteCardProps) {
  const itemCount = quote.items.length;
  const createdDate = new Date(quote.createdAt).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/${locale}/fiok/ajanlatkeres/${quote.documentId}`}>
      <Card className="hover:border-primary transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">
            {quote.requestNumber}
          </CardTitle>
          <QuoteStatusBadge status={quote.status} />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{itemCount} termék</p>
            <p>Beküldve: {createdDate}</p>
            {quote.companyName && <p>{quote.companyName}</p>}
          </div>
          {quote.quotedAmount && (
            <p className="mt-2 font-semibold">
              Árajánlat: {quote.quotedAmount.toLocaleString('hu-HU')} Ft
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
