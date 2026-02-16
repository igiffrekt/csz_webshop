import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getOrders } from '@/lib/order-api';
import { formatOrderStatus, formatPrice } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rendeléseim | CSZ Tűzvédelmi Webshop',
  description: 'Korábbi rendelések megtekintése',
};

export default async function OrderHistoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/hu/auth/bejelentkezes?redirect=/hu/fiok/rendelesek");
  }

  const { data: orders, error } = await getOrders();

  return (
    <main className="site-container py-4 sm:py-8 max-w-4xl">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/fiok">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Rendeléseim</h1>
      </div>

      {error && (
        <div className="p-4 border border-destructive rounded-lg mb-6">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {orders && orders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-medium mb-2">Még nincs rendelése</h2>
          <p className="text-muted-foreground mb-6">
            Az első rendelése után itt láthatja a rendelés történetét.
          </p>
          <Button asChild>
            <Link href="/termekek">Termékek böngészése</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order: any) => {
            const status = formatOrderStatus(order.status);
            const lineItems = typeof order.lineItems === 'string' ? JSON.parse(order.lineItems) : (order.lineItems || []);
            const itemCount = lineItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
            const orderDate = new Date(order.createdAt).toLocaleDateString('hu-HU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <Link
                key={order.id}
                href={`/fiok/rendelesek/${order.id}`}
                className="block border rounded-lg p-4 sm:p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="font-mono font-medium text-sm sm:text-base">{order.orderNumber}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{orderDate}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {itemCount} termék
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <span className="font-semibold text-sm sm:text-base">{formatPrice(order.total)}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
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
