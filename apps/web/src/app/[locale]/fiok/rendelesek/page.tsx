import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { OrderCard } from "@/components/account/OrderCard";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "@csz/types";

export const metadata: Metadata = {
  title: "Rendeléseim | CSZ Tűzvédelmi Webáruház",
  description: "Korábbi rendeléseid megtekintése",
};

// Placeholder function - will fetch from Strapi in Phase 6
async function getOrders(): Promise<Order[]> {
  // TODO: Implement in Phase 6 when Order content type exists
  // For now, return empty array
  return [];
}

export default async function OrdersPage() {
  await requireAuth();

  const orders = await getOrders();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/fiok"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a fiókhoz
        </Link>
        <h1 className="text-2xl font-bold">Rendeléseim</h1>
        <p className="text-muted-foreground mt-1">
          Korábbi rendeléseid és azok státusza
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Még nincsenek rendeléseid</h3>
          <p className="text-sm text-muted-foreground mb-4">
            A rendeléselőzményed itt fog megjelenni
          </p>
          <Link href="/termekek">
            <Button>Termékek böngészése</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.documentId} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
