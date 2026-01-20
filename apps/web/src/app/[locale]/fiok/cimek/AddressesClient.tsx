"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddressCard } from "@/components/account/AddressCard";
import { AddressForm, type AddressFormData } from "@/components/account/AddressForm";
import type { ShippingAddress } from "@csz/types";

interface AddressesClientProps {
  initialAddresses: ShippingAddress[];
}

export function AddressesClient({ initialAddresses }: AddressesClientProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | undefined>();

  const handleAdd = () => {
    setEditingAddress(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: ShippingAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: AddressFormData) => {
    // Use Server Action via fetch to API route (simpler than complex client-side logic)
    const res = await fetch("/api/addresses", {
      method: editingAddress ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: editingAddress?.documentId,
        ...data,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Hiba tortent");
    }

    setIsDialogOpen(false);
    router.refresh();
  };

  const handleDelete = async (documentId: string) => {
    const res = await fetch(`/api/addresses?documentId=${documentId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Torles sikertelen");
    }

    setAddresses(addresses.filter((a) => a.documentId !== documentId));
    router.refresh();
  };

  const handleSetDefault = async (documentId: string) => {
    const res = await fetch("/api/addresses/set-default", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });

    if (!res.ok) {
      throw new Error("Beallitas sikertelen");
    }

    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Uj cim hozzaadasa
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nincsenek mentett cimek</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adj hozza egy szallitasi cimet a gyorsabb penztari eljarashoz
          </p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Cim hozzaadasa
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.documentId}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Cim szerkesztese" : "Uj cim hozzaadasa"}
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
