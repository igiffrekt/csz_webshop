"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { ShippingAddress } from "@csz/types";

interface AddressFormProps {
  address?: ShippingAddress;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
}

export interface AddressFormData {
  label: string;
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export function AddressForm({ address, onSubmit, onCancel }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!address;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: AddressFormData = {
      label: formData.get("label") as string,
      recipientName: formData.get("recipientName") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      postalCode: formData.get("postalCode") as string,
      country: (formData.get("country") as string) || "Magyarorszag",
      phone: (formData.get("phone") as string) || "",
      isDefault: formData.get("isDefault") === "on",
    };

    // Basic validation
    if (!data.label || !data.recipientName || !data.street || !data.city || !data.postalCode) {
      setError("Toltsd ki az osszes kotelezo mezot");
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(data);
    } catch {
      setError("Hiba tortent a mentes soran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="label">Cim cimkeje *</Label>
        <Input
          id="label"
          name="label"
          type="text"
          placeholder="pl. Otthon, Iroda"
          defaultValue={address?.label || ""}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipientName">Cimzett neve *</Label>
        <Input
          id="recipientName"
          name="recipientName"
          type="text"
          defaultValue={address?.recipientName || ""}
          required
          autoComplete="name"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Utca, hazszam *</Label>
        <Input
          id="street"
          name="street"
          type="text"
          defaultValue={address?.street || ""}
          required
          autoComplete="street-address"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Iranyitoszam *</Label>
          <Input
            id="postalCode"
            name="postalCode"
            type="text"
            defaultValue={address?.postalCode || ""}
            required
            autoComplete="postal-code"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Varos *</Label>
          <Input
            id="city"
            name="city"
            type="text"
            defaultValue={address?.city || ""}
            required
            autoComplete="address-level2"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Orszag</Label>
        <Input
          id="country"
          name="country"
          type="text"
          defaultValue={address?.country || "Magyarorszag"}
          autoComplete="country-name"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefonszam</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+36 20 123 4567"
          defaultValue={address?.phone || ""}
          autoComplete="tel"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          name="isDefault"
          defaultChecked={address?.isDefault || false}
        />
        <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
          Beallitas alapertelmezett cimkent
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mentes..." : isEdit ? "Cim frissitese" : "Cim mentese"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Megse
        </Button>
      </div>
    </form>
  );
}
