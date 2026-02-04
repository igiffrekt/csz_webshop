import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { getAddresses } from "@/lib/address-api";
import { AddressesClient } from "./AddressesClient";
import { ArrowLeft } from "lucide-react";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Szállítási címek | CSZ Tűzvédelmi Webáruház",
  description: "Mentett szállítási címeid kezelése",
};

export default async function AddressesPage() {
  await requireAuth("/hu/fiok/cimek");

  const { data: addresses, error } = await getAddresses();

  return (
    <div className="site-container py-8">
      <div className="mb-6">
        <Link
          href="/fiok"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a fiókhoz
        </Link>
        <h1 className="text-2xl font-bold">Szállítási címek</h1>
        <p className="text-muted-foreground mt-1">
          Kezeld a mentett szállítási címeidet
        </p>
      </div>

      {error ? (
        <div className="text-center py-8 text-destructive">{error}</div>
      ) : (
        <AddressesClient initialAddresses={addresses || []} />
      )}
    </div>
  );
}
