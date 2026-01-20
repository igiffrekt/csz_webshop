import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export default function OrderNotFound() {
  return (
    <div className="container py-16 text-center">
      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Rendeles nem talalhato</h1>
      <p className="text-muted-foreground mb-6">
        Ez a rendeles nem letezik vagy nincs jogosultsagod a megtekinteshez.
      </p>
      <Link href="/fiok/rendelesek">
        <Button>Vissza a rendelesekhez</Button>
      </Link>
    </div>
  );
}
