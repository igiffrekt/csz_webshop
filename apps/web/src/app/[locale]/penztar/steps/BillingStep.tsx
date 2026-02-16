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
    country: newBillingAddress?.country || 'Magyarország',
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
      <h2 className="text-xl font-semibold">Számlázási adatok</h2>

      {/* Same as shipping checkbox */}
      <div className="flex items-center space-x-2 p-4 border rounded-lg">
        <Checkbox
          id="sameAsBilling"
          checked={useSameAsBilling}
          onCheckedChange={(checked) => setUseSameAsBilling(checked === true)}
        />
        <Label htmlFor="sameAsBilling" className="cursor-pointer">
          A számlázási cím megegyezik a szállítási címmel
        </Label>
      </div>

      {/* Billing address form (only if different) */}
      {!useSameAsBilling && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-medium">Számlázási cím</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Company fields (optional) */}
            <div className="sm:col-span-2 p-4 bg-muted/50 rounded-lg space-y-4">
              <p className="text-sm font-medium">Céges adatok (opcionális)</p>

              <div>
                <Label htmlFor="companyName">Cégnév</Label>
                <Input
                  id="companyName"
                  value={billingForm.companyName}
                  onChange={(e) => handleBillingChange('companyName', e.target.value)}
                  placeholder="Cég Kft."
                />
              </div>

              <div>
                <Label htmlFor="vatNumber">Adószám</Label>
                <Input
                  id="vatNumber"
                  value={billingForm.vatNumber}
                  onChange={(e) => handleBillingChange('vatNumber', e.target.value)}
                  placeholder="12345678-1-42"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="billingRecipientName">Név *</Label>
              <Input
                id="billingRecipientName"
                value={billingForm.recipientName}
                onChange={(e) => handleBillingChange('recipientName', e.target.value)}
                placeholder="Kovács János"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="billingStreet">Utca, házszám *</Label>
              <Input
                id="billingStreet"
                value={billingForm.street}
                onChange={(e) => handleBillingChange('street', e.target.value)}
                placeholder="Petőfi utca 10."
              />
            </div>

            <div>
              <Label htmlFor="billingPostalCode">Irányítószám *</Label>
              <Input
                id="billingPostalCode"
                inputMode="numeric"
                value={billingForm.postalCode}
                onChange={(e) => handleBillingChange('postalCode', e.target.value)}
                placeholder="1234"
              />
            </div>

            <div>
              <Label htmlFor="billingCity">Város *</Label>
              <Input
                id="billingCity"
                value={billingForm.city}
                onChange={(e) => handleBillingChange('city', e.target.value)}
                placeholder="Budapest"
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="billingCountry">Ország</Label>
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
        <h3 className="font-medium">Megrendelési hivatkozás (opcionális)</h3>
        <p className="text-sm text-muted-foreground">
          Céges rendelés esetén megadhatja a belső megrendelési számot, ami megjelenik a számlán.
        </p>
        <div>
          <Label htmlFor="poReference">PO szám / Hivatkozás</Label>
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
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t">
        <Button variant="outline" onClick={prevStep} className="h-11 sm:h-10">
          Vissza
        </Button>
        <Button onClick={handleContinue} disabled={!canContinue()} className="h-11 sm:h-10 rounded-full bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400">
          <span className="mr-2 text-[0.5rem] leading-none">&#9679;</span>
          Tovább az összegzéshez
        </Button>
      </div>
    </div>
  );
}
