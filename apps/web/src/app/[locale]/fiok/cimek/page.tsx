import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { requireAuth } from "@/lib/auth/dal";
import { getAddresses } from "@/lib/address-api";
import { AddressesClient } from "./AddressesClient";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Szallitasi cimek | CSZ Tuzvedelmi Webaruhaz",
  description: "Mentett szallitasi cimeid kezelese",
};

export default async function AddressesPage() {
  await requireAuth();

  const { data: addresses, error } = await getAddresses();

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link
          href="/fiok"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a fiokhoz
        </Link>
        <h1 className="text-2xl font-bold">Szallitasi cimek</h1>
        <p className="text-muted-foreground mt-1">
          Kezeld a mentett szallitasi cimeidet
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
