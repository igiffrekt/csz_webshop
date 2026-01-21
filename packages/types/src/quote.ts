export type QuoteStatus = 'pending' | 'quoted' | 'converted' | 'declined' | 'expired';

export interface QuoteItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface QuoteRequest {
  id: number;
  documentId: string;
  requestNumber: string;
  status: QuoteStatus;
  items: QuoteItem[];
  deliveryNotes?: string;
  companyName?: string;
  contactEmail: string;
  contactPhone?: string;
  adminNotes?: string;
  adminResponse?: string;
  quotedAmount?: number;
  quotedAt?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteRequestInput {
  items: QuoteItem[];
  deliveryNotes?: string;
  companyName?: string;
  contactEmail?: string;
  contactPhone?: string;
}
