import { redirect, notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth';
import { getQuoteRequest } from '@/lib/quote-api';
import { QuoteStatusBadge } from '@/components/quotes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Árajánlat részletei - CSZ Tűzvédelem',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/hu/auth/bejelentkezes?redirect=/hu/fiok/ajanlatkeres/${id}`);
  }

  const { data: quote, error } = await getQuoteRequest(id);

  if (error || !quote) {
    notFound();
  }

  const createdDate = new Date(quote.createdAt).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const validUntilDate = quote.validUntil
    ? new Date(quote.validUntil).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const items = typeof quote.items === 'string' ? JSON.parse(quote.items) : (quote.items || []);

  return (
    <div className="site-container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/fiok/ajanlatkeres">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{quote.requestNumber}</h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="text-muted-foreground">Beküldve: {createdDate}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kapcsolattartási adatok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quote.companyName && (
              <div>
                <span className="text-muted-foreground">Cégnév:</span>{' '}
                {quote.companyName}
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Email:</span>{' '}
              {quote.contactEmail}
            </div>
            {quote.contactPhone && (
              <div>
                <span className="text-muted-foreground">Telefon:</span>{' '}
                {quote.contactPhone}
              </div>
            )}
          </CardContent>
        </Card>

        {quote.quotedAmount && (
          <Card>
            <CardHeader>
              <CardTitle>Árajánlat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">
                {quote.quotedAmount.toLocaleString('hu-HU')} Ft
              </div>
              {quote.quotedAt && (
                <div className="text-sm text-muted-foreground">
                  Árajánlat dátuma:{' '}
                  {new Date(quote.quotedAt).toLocaleDateString('hu-HU')}
                </div>
              )}
              {validUntilDate && (
                <div className="text-sm text-muted-foreground">
                  Érvényes: {validUntilDate}-ig
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kért termékek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item: any, index: number) => (
              <div key={index}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.quantity} db</p>
                    {item.unitPrice && (
                      <p className="text-sm text-muted-foreground">
                        {item.unitPrice.toLocaleString('hu-HU')} Ft/db
                      </p>
                    )}
                    {item.totalPrice && (
                      <p className="font-medium">
                        {item.totalPrice.toLocaleString('hu-HU')} Ft
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {quote.deliveryNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Szállítási megjegyzések</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{quote.deliveryNotes}</p>
          </CardContent>
        </Card>
      )}

      {quote.adminResponse && (
        <Card>
          <CardHeader>
            <CardTitle>Válasz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{quote.adminResponse}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
