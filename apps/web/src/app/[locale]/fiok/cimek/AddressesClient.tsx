"use client";

import { useState, useEffect, useTransition } from "react";
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
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/address-actions";

interface AddressesClientProps {
  initialAddresses: ShippingAddress[];
}

export function AddressesClient({ initialAddresses }: AddressesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | undefined>();

  // Sync state when initialAddresses changes (e.g., after router.refresh())
  useEffect(() => {
    setAddresses(initialAddresses);
  }, [initialAddresses]);

  const handleAdd = () => {
    setEditingAddress(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: ShippingAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: AddressFormData) => {
    const result = editingAddress
      ? await updateAddressAction(editingAddress.documentId, data)
      : await createAddressAction(data);

    if (!result.success) {
      throw new Error(result.error || "Hiba történt");
    }

    setIsDialogOpen(false);
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = async (documentId: string) => {
    const result = await deleteAddressAction(documentId);

    if (!result.success) {
      throw new Error(result.error || "Törlés sikertelen");
    }

    // Optimistic update
    setAddresses(addresses.filter((a) => a.documentId !== documentId));
  };

  const handleSetDefault = async (documentId: string) => {
    const result = await setDefaultAddressAction(documentId);

    if (!result.success) {
      throw new Error(result.error || "Beállítás sikertelen");
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleAdd} disabled={isPending}>
          <Plus className="h-4 w-4 mr-2" />
          Új cím hozzáadása
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Nincsenek mentett címek</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Adj hozzá egy szállítási címet a gyorsabb pénztári eljáráshoz
          </p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Cím hozzáadása
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
              {editingAddress ? "Cím szerkesztése" : "Új cím hozzáadása"}
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
