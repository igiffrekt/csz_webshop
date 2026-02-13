import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getOrder } from '@/lib/order-api';
import { formatHUF } from '@/lib/checkout-api';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Banknote, Copy } from 'lucide-react';
import type { Metadata } from 'next';
import { CopyButton } from './CopyButton';

export const metadata: Metadata = {
  title: 'Banki átutalás | Dunamenti CSZ Webshop',
  description: 'Banki átutalás részletei',
};

interface Props {
  searchParams: Promise<{ order_id?: string }>;
}

export default async function BankTransferPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect('/hu/auth/bejelentkezes');
  }

  const { order_id } = await searchParams;

  if (!order_id) {
    redirect('/hu/penztar');
  }

  const { data: order, error } = await getOrder(order_id);

  if (error || !order) {
    redirect('/hu/fiok/rendelesek');
  }

  const paymentReference = `CSZ-${order.orderNumber}`;

  return (
    <main className="site-container py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <Banknote className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Banki átutalás</h1>
        <p className="text-muted-foreground">
          Kérem utalja át az alábbi összeget a megadott bankszámlára.
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        {/* Amount */}
        <div className="text-center py-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Fizetendő összeg</p>
          <p className="text-3xl font-bold">{formatHUF(order.total)}</p>
        </div>

        {/* Bank details */}
        <div className="space-y-4">
          <h2 className="font-semibold">Bankszámla adatok</h2>

          <div className="grid gap-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <p className="text-sm text-muted-foreground">Kedvezményezett neve</p>
                <p className="font-medium">Dunamenti CSZ Kft.</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <p className="text-sm text-muted-foreground">Bank neve</p>
                <p className="font-medium">OTP Bank</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <p className="text-sm text-muted-foreground">IBAN</p>
                <p className="font-mono font-medium">HU12 1234 5678 9012 3456 7890 1234</p>
              </div>
              <CopyButton value="HU12123456789012345678901234" />
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
              <div>
                <p className="text-sm text-muted-foreground">BIC/SWIFT</p>
                <p className="font-mono font-medium">OTPVHUHB</p>
              </div>
              <CopyButton value="OTPVHUHB" />
            </div>

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground">Közlemény (FONTOS!)</p>
                <p className="font-mono font-medium text-primary">{paymentReference}</p>
              </div>
              <CopyButton value={paymentReference} />
            </div>
          </div>
        </div>

        {/* Important notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Fontos tudnivalók</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Kérem pontosan a megadott közleményt használja</li>
            <li>Az utalás után a rendelést 24-48 órán belül feldolgozzuk</li>
            <li>Hibás közlemény esetén keresse ügyfélszolgálatunkat</li>
          </ul>
        </div>

        {/* Order reference */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Rendelés száma: <span className="font-mono">{order.orderNumber}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button asChild className="flex-1">
          <Link href="/fiok/rendelesek">Rendeléseim megtekintése</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/termekek">Vásárlás folytatása</Link>
        </Button>
      </div>
    </main>
  );
}
