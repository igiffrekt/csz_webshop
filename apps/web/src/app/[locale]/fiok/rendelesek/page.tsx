import { requireAuth } from '@/lib/auth/dal';
import { getOrders } from '@/lib/order-api';
import { formatOrderStatus, formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rendeleseim | CSZ Tuzvedelmi Webshop',
  description: 'Korabbi rendelesek megtekintese',
};

export default async function OrderHistoryPage() {
  await requireAuth("/hu/fiok/rendelesek");

  const { data: orders, error } = await getOrders();

  return (
    <main className="site-container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/fiok">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Rendeleseim</h1>
      </div>

      {error && (
        <div className="p-4 border border-destructive rounded-lg mb-6">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {orders && orders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-medium mb-2">Meg nincs rendelese</h2>
          <p className="text-muted-foreground mb-6">
            Az elso rendelese utan itt lathatja a rendeles tortenetet.
          </p>
          <Button asChild>
            <Link href="/termekek">Termekek bongeszese</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => {
            const status = formatOrderStatus(order.status);
            const itemCount = order.lineItems.reduce((sum, item) => sum + item.quantity, 0);
            const orderDate = new Date(order.createdAt).toLocaleDateString('hu-HU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <Link
                key={order.documentId}
                href={`/fiok/rendelesek/${order.documentId}`}
                className="block border rounded-lg p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium">{order.orderNumber}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{orderDate}</p>
                    <p className="text-sm text-muted-foreground">
                      {itemCount} termek
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
