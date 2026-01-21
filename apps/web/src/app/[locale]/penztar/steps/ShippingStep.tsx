'use client';

import { useState, useEffect } from 'react';
import { useCheckoutStore } from '@/stores/checkout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { PlusCircle, MapPin } from 'lucide-react';
import type { ShippingAddress } from '@csz/types';

interface ShippingStepProps {
  addresses: ShippingAddress[];
}

export function ShippingStep({ addresses }: ShippingStepProps) {
  const {
    shippingAddressId,
    useNewShippingAddress,
    newShippingAddress,
    setShippingAddressId,
    setUseNewShippingAddress,
    setNewShippingAddress,
    nextStep,
  } = useCheckoutStore();

  // Form state for new address
  const [newAddress, setNewAddress] = useState({
    recipientName: newShippingAddress?.recipientName || '',
    street: newShippingAddress?.street || '',
    city: newShippingAddress?.city || '',
    postalCode: newShippingAddress?.postalCode || '',
    country: newShippingAddress?.country || 'Magyarorszag',
    phone: newShippingAddress?.phone || '',
  });

  // Find default address
  const defaultAddress = addresses.find(a => a.isDefault);

  // Set default address on first load if nothing selected
  useEffect(() => {
    if (!shippingAddressId && !useNewShippingAddress && defaultAddress) {
      setShippingAddressId(defaultAddress.documentId);
    }
  }, [defaultAddress, shippingAddressId, useNewShippingAddress, setShippingAddressId]);

  const handleAddressSelect = (value: string) => {
    if (value === 'new') {
      setUseNewShippingAddress(true);
    } else {
      setShippingAddressId(value);
    }
  };

  const handleNewAddressChange = (field: string, value: string) => {
    const updated = { ...newAddress, [field]: value };
    setNewAddress(updated);
    setNewShippingAddress(updated);
  };

  const canContinue = () => {
    if (useNewShippingAddress) {
      return (
        newAddress.recipientName.trim() &&
        newAddress.street.trim() &&
        newAddress.city.trim() &&
        newAddress.postalCode.trim()
      );
    }
    return !!shippingAddressId;
  };

  const handleContinue = () => {
    if (canContinue()) {
      nextStep();
    }
  };

  const selectedValue = useNewShippingAddress ? 'new' : (shippingAddressId || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Szallitasi cim</h2>
        {addresses.length > 0 && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/fiok/cimek">
              <MapPin className="h-4 w-4 mr-1" />
              Cimek kezelese
            </Link>
          </Button>
        )}
      </div>

      {addresses.length === 0 && !useNewShippingAddress ? (
        // No saved addresses - show new address form directly
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            Nincs mentett szallitasi cime.
          </p>
          <Button onClick={() => setUseNewShippingAddress(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Uj cim megadasa
          </Button>
        </div>
      ) : (
        <RadioGroup value={selectedValue} onValueChange={handleAddressSelect}>
          {/* Saved addresses */}
          {addresses.map((address) => (
            <div
              key={address.documentId}
              className={`
                flex items-start space-x-3 p-4 border rounded-lg cursor-pointer
                ${selectedValue === address.documentId ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
              `}
            >
              <RadioGroupItem value={address.documentId} id={address.documentId} />
              <Label htmlFor={address.documentId} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{address.label}</span>
                  {address.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Alapertelmezett
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <p>{address.recipientName}</p>
                  <p>{address.street}</p>
                  <p>{address.postalCode} {address.city}</p>
                  {address.phone && <p>Tel: {address.phone}</p>}
                </div>
              </Label>
            </div>
          ))}

          {/* New address option */}
          <div
            className={`
              flex items-start space-x-3 p-4 border rounded-lg cursor-pointer
              ${selectedValue === 'new' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
            `}
          >
            <RadioGroupItem value="new" id="new-address" />
            <Label htmlFor="new-address" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                <span className="font-medium">Uj cim megadasa</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      )}

      {/* New address form */}
      {useNewShippingAddress && (
        <div className="border rounded-lg p-6 space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="recipientName">Cimzett neve *</Label>
              <Input
                id="recipientName"
                value={newAddress.recipientName}
                onChange={(e) => handleNewAddressChange('recipientName', e.target.value)}
                placeholder="Kovacs Janos"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="street">Utca, hazszam *</Label>
              <Input
                id="street"
                value={newAddress.street}
                onChange={(e) => handleNewAddressChange('street', e.target.value)}
                placeholder="Petofi utca 10."
              />
            </div>

            <div>
              <Label htmlFor="postalCode">Iranyitoszam *</Label>
              <Input
                id="postalCode"
                value={newAddress.postalCode}
                onChange={(e) => handleNewAddressChange('postalCode', e.target.value)}
                placeholder="1234"
              />
            </div>

            <div>
              <Label htmlFor="city">Varos *</Label>
              <Input
                id="city"
                value={newAddress.city}
                onChange={(e) => handleNewAddressChange('city', e.target.value)}
                placeholder="Budapest"
              />
            </div>

            <div>
              <Label htmlFor="country">Orszag</Label>
              <Input
                id="country"
                value={newAddress.country}
                onChange={(e) => handleNewAddressChange('country', e.target.value)}
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Csak Magyarorszagra szallitunk
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Telefonszam</Label>
              <Input
                id="phone"
                value={newAddress.phone}
                onChange={(e) => handleNewAddressChange('phone', e.target.value)}
                placeholder="+36 30 123 4567"
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" asChild>
          <Link href="/kosar">Vissza a kosarhoz</Link>
        </Button>
        <Button onClick={handleContinue} disabled={!canContinue()}>
          Tovabb a szamlazashoz
        </Button>
      </div>
    </div>
  );
}
