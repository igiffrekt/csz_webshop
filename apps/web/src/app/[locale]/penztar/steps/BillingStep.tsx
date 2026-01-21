'use client';

import { useState } from 'react';
import { useCheckoutStore } from '@/stores/checkout';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function BillingStep() {
  const {
    useSameAsBilling,
    newBillingAddress,
    poReference,
    setUseSameAsBilling,
    setNewBillingAddress,
    setPoReference,
    prevStep,
    nextStep,
  } = useCheckoutStore();

  const [billingForm, setBillingForm] = useState({
    recipientName: newBillingAddress?.recipientName || '',
    street: newBillingAddress?.street || '',
    city: newBillingAddress?.city || '',
    postalCode: newBillingAddress?.postalCode || '',
    country: newBillingAddress?.country || 'Magyarorszag',
    companyName: newBillingAddress?.companyName || '',
    vatNumber: newBillingAddress?.vatNumber || '',
  });

  const [poRef, setPoRef] = useState(poReference);

  const handleBillingChange = (field: string, value: string) => {
    const updated = { ...billingForm, [field]: value };
    setBillingForm(updated);
    setNewBillingAddress(updated);
  };

  const handlePoReferenceChange = (value: string) => {
    setPoRef(value);
    setPoReference(value);
  };

  const canContinue = () => {
    if (useSameAsBilling) {
      return true;
    }
    // Require basic billing address fields
    return (
      billingForm.recipientName.trim() &&
      billingForm.street.trim() &&
      billingForm.city.trim() &&
      billingForm.postalCode.trim()
    );
  };

  const handleContinue = () => {
    if (canContinue()) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Szamlazasi adatok</h2>

      {/* Same as shipping checkbox */}
      <div className="flex items-center space-x-2 p-4 border rounded-lg">
        <Checkbox
          id="sameAsBilling"
          checked={useSameAsBilling}
          onCheckedChange={(checked) => setUseSameAsBilling(checked === true)}
        />
        <Label htmlFor="sameAsBilling" className="cursor-pointer">
          A szamlazasi cim megegyezik a szallitasi cimmel
        </Label>
      </div>

      {/* Billing address form (only if different) */}
      {!useSameAsBilling && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-medium">Szamlazasi cim</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Company fields (optional) */}
            <div className="sm:col-span-2 p-4 bg-muted/50 rounded-lg space-y-4">
              <p className="text-sm font-medium">Ceges adatok (opcionalis)</p>

              <div>
                <Label htmlFor="companyName">Cegnev</Label>
                <Input
                  id="companyName"
                  value={billingForm.companyName}
                  onChange={(e) => handleBillingChange('companyName', e.target.value)}
                  placeholder="Ceg Kft."
                />
              </div>

              <div>
                <Label htmlFor="vatNumber">Adoszam</Label>
                <Input
                  id="vatNumber"
                  value={billingForm.vatNumber}
                  onChange={(e) => handleBillingChange('vatNumber', e.target.value)}
                  placeholder="12345678-1-42"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="billingRecipientName">Nev *</Label>
              <Input
                id="billingRecipientName"
                value={billingForm.recipientName}
                onChange={(e) => handleBillingChange('recipientName', e.target.value)}
                placeholder="Kovacs Janos"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="billingStreet">Utca, hazszam *</Label>
              <Input
                id="billingStreet"
                value={billingForm.street}
                onChange={(e) => handleBillingChange('street', e.target.value)}
                placeholder="Petofi utca 10."
              />
            </div>

            <div>
              <Label htmlFor="billingPostalCode">Iranyitoszam *</Label>
              <Input
                id="billingPostalCode"
                value={billingForm.postalCode}
                onChange={(e) => handleBillingChange('postalCode', e.target.value)}
                placeholder="1234"
              />
            </div>

            <div>
              <Label htmlFor="billingCity">Varos *</Label>
              <Input
                id="billingCity"
                value={billingForm.city}
                onChange={(e) => handleBillingChange('city', e.target.value)}
                placeholder="Budapest"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="billingCountry">Orszag</Label>
              <Input
                id="billingCountry"
                value={billingForm.country}
                disabled
              />
            </div>
          </div>
        </div>
      )}

      {/* PO Reference (B2B) */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-medium">Megrendelesi hivatkozas (opcionalis)</h3>
        <p className="text-sm text-muted-foreground">
          Ceges rendeles eseten megadhatja a belso megrendelesi szamot, ami megjelenik a szamlan.
        </p>
        <div>
          <Label htmlFor="poReference">PO szam / Hivatkozas</Label>
          <Input
            id="poReference"
            value={poRef}
            onChange={(e) => handlePoReferenceChange(e.target.value)}
            placeholder="PO-2026-001"
            maxLength={100}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={prevStep}>
          Vissza
        </Button>
        <Button onClick={handleContinue} disabled={!canContinue()}>
          Tovabb az osszegzeshez
        </Button>
      </div>
    </div>
  );
}
