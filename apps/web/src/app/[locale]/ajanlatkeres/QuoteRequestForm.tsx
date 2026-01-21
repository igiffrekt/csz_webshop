'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Send } from 'lucide-react';
import { ProductSelector } from './ProductSelector';
import { createQuoteRequest } from '@/lib/quote-api';
import type { QuoteItem } from '@csz/types';

interface QuoteRequestFormProps {
  userEmail: string;
  companyName?: string;
  phone?: string;
}

export function QuoteRequestForm({ userEmail, companyName, phone }: QuoteRequestFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [contactEmail, setContactEmail] = useState(userEmail);
  const [contactPhone, setContactPhone] = useState(phone || '');
  const [company, setCompany] = useState(companyName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setError('Kérem adjon hozzá legalább egy terméket');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { data, error: apiError } = await createQuoteRequest({
      items,
      deliveryNotes: deliveryNotes || undefined,
      companyName: company || undefined,
      contactEmail,
      contactPhone: contactPhone || undefined,
    });

    if (apiError || !data) {
      setError(apiError || 'Hiba történt az árajánlat kérés küldésekor');
      setIsSubmitting(false);
      return;
    }

    // Redirect to success page
    router.push(`/hu/ajanlatkeres/sikeres?id=${data.documentId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Products Section */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Termékek *</Label>
        <p className="text-sm text-muted-foreground">
          Keresse meg és adja hozzá a kívánt termékeket a mennyiséggel
        </p>
        <ProductSelector items={items} onItemsChange={setItems} />
      </div>

      {/* Delivery Notes */}
      <div className="space-y-2">
        <Label htmlFor="deliveryNotes">Megjegyzések a szállításhoz</Label>
        <Textarea
          id="deliveryNotes"
          placeholder="Speciális igények, szállítási határidő, stb."
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          rows={4}
        />
      </div>

      {/* Contact Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Cégnév</Label>
          <Input
            id="companyName"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Cég neve"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Kapcsolattartó email *</Label>
          <Input
            id="contactEmail"
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2 sm:w-1/2">
          <Label htmlFor="contactPhone">Telefonszám</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+36 ..."
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <div className="pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || items.length === 0}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Küldés...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Árajánlat kérés küldése
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
