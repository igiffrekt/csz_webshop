import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { formatPrice } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import type { Order, OrderStatus } from "@csz/types";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Fizetésre vár",
  paid: "Fizetve",
  processing: "Feldolgozás alatt",
  shipped: "Kiszállítva",
  delivered: "Kézbesítve",
  cancelled: "Törölve",
  refunded: "Visszatérítve",
};

const statusVariants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "default",
  processing: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Rendelés #${id.substring(0, 8)} | CSZ Tűzvédelmi Webáruház`,
  };
}

// Placeholder function - will fetch from Strapi in Phase 6
async function getOrder(documentId: string): Promise<Order | null> {
  // TODO: Implement in Phase 6 when Order content type exists
  return null;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;

  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/fiok/rendelesek"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a rendelésekhez
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">Rendelés #{order.orderNumber}</h1>
          <Badge variant={statusVariants[order.status]}>
            {statusLabels[order.status]}
          </Badge>
        </div>
        <p className="text-muted-foreground">{formattedDate}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Rendelt termékek</h2>
            </div>
            <div className="divide-y">
              {order.lineItems.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} db x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(item.total)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order summary and addresses */}
        <div className="space-y-6">
          {/* Price summary */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-4">Összesítés</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Részösszeg</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Kedvezmény</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Szállítás</span>
                <span>
                  {order.shipping === 0
                    ? "Ingyenes"
                    : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AFA (27%)</span>
                <span>{formatPrice(order.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Összesen</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Szállítási cím</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.postalCode} {order.shippingAddress.city}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p>Tel: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Billing address */}
          {order.billingAddress && (
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Számlázási cím</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                {order.billingAddress.companyName && (
                  <p className="font-medium text-foreground">
                    {order.billingAddress.companyName}
                  </p>
                )}
                {order.billingAddress.vatNumber && (
                  <p>Adószám: {order.billingAddress.vatNumber}</p>
                )}
                <p>{order.billingAddress.recipientName}</p>
                <p>{order.billingAddress.street}</p>
                <p>
                  {order.billingAddress.postalCode} {order.billingAddress.city}
                </p>
                <p>{order.billingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Payment info */}
          {order.paymentMethod && (
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Fizetés</h2>
              <div className="text-sm text-muted-foreground">
                <p>{order.paymentMethod}</p>
                {order.paidAt && (
                  <p>
                    Fizetve:{" "}
                    {new Date(order.paidAt).toLocaleDateString("hu-HU")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
