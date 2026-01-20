import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/actions";
import { User, Package, MapPin, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Fiokom | CSZ Tuzvedelmi Webaruhaz",
  description: "A fiok beallitasaid es rendeleseid",
};

export default async function AccountPage() {
  const session = await requireAuth();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Fiokom</h1>
        <p className="text-muted-foreground mt-1">
          Udvozollek, {session.username}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/fiok/profil"
          className="group p-6 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Profil beallitasok</h2>
              <p className="text-sm text-muted-foreground">
                Szemelyes adatok modositasa
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/fiok/cimek"
          className="group p-6 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Szallitasi cimek</h2>
              <p className="text-sm text-muted-foreground">
                Mentett cimek kezelese
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/fiok/rendelesek"
          className="group p-6 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Rendeleseim</h2>
              <p className="text-sm text-muted-foreground">
                Korabbi rendelesek megtekintese
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 p-6 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-4 mb-4">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Fiok informaciok</h3>
        </div>
        <dl className="grid gap-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Email:</dt>
            <dd>{session.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Felhasznalonev:</dt>
            <dd>{session.username}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8">
        <form action={logoutAction}>
          <Button variant="outline" type="submit">
            Kijelentkezes
          </Button>
        </form>
      </div>
    </div>
  );
}
