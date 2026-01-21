import { requireAuth } from '@/lib/auth/dal';
import { getOrder } from '@/lib/order-api';
import { formatOrderStatus, formatPrice } from '@/lib/formatters';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Package, FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rendeles reszletei | CSZ Tuzvedelmi Webshop',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  await requireAuth();

  const { id } = await params;
  const { data: order, error } = await getOrder(id);

  if (error || !order) {
    notFound();
  }

  const status = formatOrderStatus(order.status);
  const orderDate = new Date(order.createdAt).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/fiok/rendelesek">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{orderDate}</p>
        </div>
        <Badge variant={status.variant} className="ml-auto">
          {status.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line items */}
          <div className="border rounded-lg p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Termekek
            </h2>
            <div className="space-y-4">
              {order.lineItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-6">
              <h2 className="font-semibold mb-2">Szallitasi cim</h2>
              <div className="text-sm text-muted-foreground">
                <p>{order.shippingAddress.recipientName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
              </div>
            </div>

            {order.billingAddress && (
              <div className="border rounded-lg p-6">
                <h2 className="font-semibold mb-2">Szamlazasi cim</h2>
                <div className="text-sm text-muted-foreground">
                  {order.billingAddress.companyName && (
                    <p className="font-medium">{order.billingAddress.companyName}</p>
                  )}
                  {order.billingAddress.vatNumber && (
                    <p>Adoszam: {order.billingAddress.vatNumber}</p>
                  )}
                  <p>{order.billingAddress.recipientName}</p>
                  <p>{order.billingAddress.street}</p>
                  <p>{order.billingAddress.postalCode} {order.billingAddress.city}</p>
                </div>
              </div>
            )}
          </div>

          {/* PO Reference */}
          {order.poReference && (
            <div className="border rounded-lg p-6">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Megrendelesi hivatkozas
              </h2>
              <p className="font-mono">{order.poReference}</p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="font-semibold mb-4">Osszegzes</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Reszosszeg</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Kedvezmeny</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Szallitas</span>
                <span>{order.shipping === 0 ? 'Ingyenes' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>AFA (27%)</span>
                <span>{formatPrice(order.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Osszesen</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.paidAt && (
              <p className="text-xs text-muted-foreground mt-4">
                Fizetve: {new Date(order.paidAt).toLocaleDateString('hu-HU')}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
