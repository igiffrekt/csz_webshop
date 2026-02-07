import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
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

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link
      href={`/fiok/rendelesek/${order.id}`}
      className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">#{order.orderNumber}</span>
            <Badge variant={statusVariants[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatPrice(order.total)}</p>
          <p className="text-sm text-muted-foreground">
            {order.lineItems.length} termék
          </p>
        </div>
      </div>
    </Link>
  );
}
