import "server-only";
import { getSession } from "./auth/session";
import type { ShippingAddress } from "@csz/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

interface AddressInput {
  label: string;
  recipientName: string;
  street: string;
  city: string;
  postalCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

/**
 * Get all shipping addresses for current user
 */
export async function getAddresses(): Promise<ApiResponse<ShippingAddress[]>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: "Nincs bejelentkezve" };
  }

  try {
    // Fetch addresses - controller automatically filters by authenticated user
    const url = `${STRAPI_URL}/api/shipping-addresses?sort=isDefault:desc,createdAt:desc`;

    const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { data: null, error: "Címek betöltése sikertelen" };
    }

    const json = await res.json();
    return { data: json.data || [] };
  } catch {
    return { data: null, error: "Hiba történt" };
  }
}

/**
 * Create a new shipping address
 */
export async function createAddress(
  input: AddressInput
): Promise<ApiResponse<ShippingAddress>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: "Nincs bejelentkezve" };
  }

  try {
    // If this is set as default, unset other defaults first
    if (input.isDefault) {
      await clearDefaultAddresses(session.jwt);
    }

    const res = await fetch(`${STRAPI_URL}/api/shipping-addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify({
        data: {
          ...input,
          country: input.country || "Magyarország",
          // user is automatically assigned by the controller
        },
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        data: null,
        error: error.error?.message || "Cím létrehozása sikertelen",
      };
    }

    const json = await res.json();
    return { data: json.data };
  } catch {
    return { data: null, error: "Hiba történt" };
  }
}

/**
 * Update an existing shipping address
 */
export async function updateAddress(
  documentId: string,
  input: Partial<AddressInput>
): Promise<ApiResponse<ShippingAddress>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: "Nincs bejelentkezve" };
  }

  try {
    // If setting as default, unset other defaults first
    if (input.isDefault) {
      await clearDefaultAddresses(session.jwt);
    }

    const res = await fetch(
      `${STRAPI_URL}/api/shipping-addresses/${documentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({ data: input }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        data: null,
        error: error.error?.message || "Cím frissítése sikertelen",
      };
    }

    const json = await res.json();
    return { data: json.data };
  } catch {
    return { data: null, error: "Hiba történt" };
  }
}

/**
 * Delete a shipping address
 */
export async function deleteAddress(
  documentId: string
): Promise<ApiResponse<boolean>> {
  const session = await getSession();
  if (!session) {
    return { data: null, error: "Nincs bejelentkezve" };
  }

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/shipping-addresses/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
      }
    );

    if (!res.ok) {
      return { data: null, error: "Cím törlése sikertelen" };
    }

    return { data: true };
  } catch {
    return { data: null, error: "Hiba történt" };
  }
}

/**
 * Helper to clear all default flags before setting a new default.
 * Uses parallel requests for better performance.
 */
async function clearDefaultAddresses(jwt: string): Promise<void> {
  try {
    // Get all addresses that are currently default (controller filters by user automatically)
    const res = await fetch(
      `${STRAPI_URL}/api/shipping-addresses?filters[isDefault][$eq]=true`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );

    if (!res.ok) return;

    const json = await res.json();
    const addresses = json.data || [];

    // Unset default for all addresses in parallel for better performance
    await Promise.all(
      addresses.map((addr: { documentId: string }) =>
        fetch(`${STRAPI_URL}/api/shipping-addresses/${addr.documentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ data: { isDefault: false } }),
        })
      )
    );
  } catch {
    // Ignore errors in cleanup - this is a best-effort operation
  }
}
