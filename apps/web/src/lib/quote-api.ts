'use server';

import { getSession } from '@/lib/auth/session';
import type { QuoteRequest, CreateQuoteRequestInput } from '@csz/types';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession();
  if (!session?.jwt) {
    throw new Error('Bejelentkezés szükséges');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.jwt}`,
  };
}

export async function createQuoteRequest(
  input: CreateQuoteRequestInput
): Promise<{ data: QuoteRequest | null; error?: string }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${STRAPI_URL}/api/quote-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: input }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { data: null, error: errorData.error?.message || 'Hiba történt az árajánlat kérés küldésekor' };
    }

    const json = await response.json();
    return { data: json.data };
  } catch (error) {
    if (error instanceof Error && error.message === 'Bejelentkezés szükséges') {
      return { data: null, error: error.message };
    }
    return { data: null, error: 'Kapcsolódási hiba' };
  }
}

export async function getQuoteRequests(
  jwt?: string
): Promise<{ data: QuoteRequest[]; error?: string }> {
  try {
    let headers: HeadersInit;
    if (jwt) {
      headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      };
    } else {
      headers = await getAuthHeaders();
    }

    const response = await fetch(`${STRAPI_URL}/api/quote-requests`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      return { data: [], error: 'Hiba történt az árajánlat kérések lekérésekor' };
    }

    const json = await response.json();
    return { data: json.data || [] };
  } catch (error) {
    if (error instanceof Error && error.message === 'Bejelentkezés szükséges') {
      return { data: [], error: error.message };
    }
    return { data: [], error: 'Kapcsolódási hiba' };
  }
}

export async function getQuoteRequest(
  documentId: string,
  jwt?: string
): Promise<{ data: QuoteRequest | null; error?: string }> {
  try {
    let headers: HeadersInit;
    if (jwt) {
      headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      };
    } else {
      headers = await getAuthHeaders();
    }

    const response = await fetch(`${STRAPI_URL}/api/quote-requests/${documentId}`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      return { data: null, error: 'Árajánlat kérés nem található' };
    }

    const json = await response.json();
    return { data: json.data };
  } catch (error) {
    if (error instanceof Error && error.message === 'Bejelentkezés szükséges') {
      return { data: null, error: error.message };
    }
    return { data: null, error: 'Kapcsolódási hiba' };
  }
}
