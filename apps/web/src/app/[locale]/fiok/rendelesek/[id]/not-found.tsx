import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function OrderNotFound() {
  return (
    <div className="container py-16 text-center">
      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Rendelés nem található</h1>
      <p className="text-muted-foreground mb-6">
        Ez a rendelés nem létezik vagy nincs jogosultságod a megtekintéséhez.
      </p>
      <Link href="/fiok/rendelesek">
        <Button>Vissza a rendelésekhez</Button>
      </Link>
    </div>
  );
}
