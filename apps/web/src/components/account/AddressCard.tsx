"use client";

import { useState } from "react";
import { Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ShippingAddress } from "@csz/types";

interface AddressCardProps {
  address: ShippingAddress;
  onEdit: (address: ShippingAddress) => void;
  onDelete: (documentId: string) => Promise<void>;
  onSetDefault: (documentId: string) => Promise<void>;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(address.id);
    setIsDeleting(false);
  };

  const handleSetDefault = async () => {
    if (address.isDefault) return;
    setIsSettingDefault(true);
    await onSetDefault(address.id);
    setIsSettingDefault(false);
  };

  return (
    <div className="border rounded-lg p-4 relative">
      {address.isDefault && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          <Star className="h-3 w-3 fill-current" />
          Alapértelmezett
        </div>
      )}

      <div className="mb-3">
        <h3 className="font-semibold">{address.label}</h3>
      </div>

      <div className="text-sm text-muted-foreground space-y-1">
        <p>{address.recipientName}</p>
        <p>{address.street}</p>
        <p>
          {address.postalCode} {address.city}
        </p>
        <p>{address.country}</p>
        {address.phone && <p>Tel: {address.phone}</p>}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Szerkesztés
        </Button>

        {!address.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSetDefault}
            disabled={isSettingDefault}
          >
            <Star className="h-4 w-4 mr-1" />
            {isSettingDefault ? "Mentés..." : "Alapértelmezett"}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Törlés
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cím törlése</AlertDialogTitle>
              <AlertDialogDescription>
                Biztosan törölni szeretnéd a(z) &quot;{address.label}&quot; címet?
                Ez a művelet nem vonható vissza.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Mégse</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Törlés..." : "Törlés"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
