const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface LineItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CalculateTotalsRequest {
  lineItems: LineItem[];
  couponCode?: string;
  shippingCountry: string;
}

export interface CalculateTotalsResponse {
  subtotal: number;
  discount: number;
  shipping: number;
  netTotal: number;
  vatAmount: number;
  total: number;
  freeShippingThreshold: number;
  couponApplied: boolean;
  couponError?: string;
}

/**
 * Calculate order totals from server
 * CRITICAL: Never calculate VAT, shipping, or discounts client-side
 */
export async function calculateTotals(
  request: CalculateTotalsRequest
): Promise<{ data: CalculateTotalsResponse | null; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/checkout/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: errorData.error || 'Hiba történt a számításnál' };
    }

    const data = await response.json();
    return { data };
  } catch {
    return { data: null, error: 'Kapcsolódási hiba' };
  }
}

/**
 * Create bank transfer order
 */
export interface BankTransferRequest {
  lineItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    name: string;
    variantName?: string;
    sku: string;
    price: number;
  }>;
  shippingAddress: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  billingAddress?: {
    recipientName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    companyName?: string;
    vatNumber?: string;
  };
  couponCode?: string;
  poReference?: string;
  userId: number;
}

export interface BankTransferResponse {
  orderId: string;
  orderNumber: string;
  total: number;
  bankAccount: {
    accountHolder: string;
    bankName: string;
    iban: string;
    bic: string;
  };
  paymentReference: string;
}

export async function createBankTransferOrder(
  request: BankTransferRequest
): Promise<{ data: BankTransferResponse | null; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/checkout/bank-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: errorData.error || 'Hiba történt a rendelés létrehozásakor' };
    }

    const data = await response.json();
    return { data };
  } catch {
    return { data: null, error: 'Kapcsolódási hiba' };
  }
}

/**
 * Format price in Hungarian Forint
 */
export function formatHUF(amount: number): string {
  return amount.toLocaleString('hu-HU') + ' Ft';
}

/**
 * Format date in Hungarian format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
