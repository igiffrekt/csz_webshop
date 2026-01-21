"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
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

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a new shipping address
 */
export async function createAddressAction(
  input: AddressInput
): Promise<ActionResult<ShippingAddress>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Nincs bejelentkezve" };
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
        },
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.error?.message || "Cím létrehozása sikertelen",
      };
    }

    const json = await res.json();
    revalidatePath("/hu/fiok/cimek");
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Hiba történt" };
  }
}

/**
 * Update an existing shipping address
 */
export async function updateAddressAction(
  documentId: string,
  input: Partial<AddressInput>
): Promise<ActionResult<ShippingAddress>> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Nincs bejelentkezve" };
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
        success: false,
        error: error.error?.message || "Cím frissítése sikertelen",
      };
    }

    const json = await res.json();
    revalidatePath("/hu/fiok/cimek");
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Hiba történt" };
  }
}

/**
 * Delete a shipping address
 */
export async function deleteAddressAction(
  documentId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Nincs bejelentkezve" };
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
      const text = await res.text();
      console.error("[deleteAddressAction] Strapi error:", res.status, text);
      return { success: false, error: "Cím törlése sikertelen" };
    }

    revalidatePath("/hu/fiok/cimek");
    return { success: true };
  } catch (err) {
    console.error("[deleteAddressAction] exception:", err);
    return { success: false, error: "Hiba történt" };
  }
}

/**
 * Set an address as the default
 */
export async function setDefaultAddressAction(
  documentId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Nincs bejelentkezve" };
  }

  try {
    // Clear other defaults first
    await clearDefaultAddresses(session.jwt);

    // Set the new default
    const res = await fetch(
      `${STRAPI_URL}/api/shipping-addresses/${documentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({ data: { isDefault: true } }),
      }
    );

    if (!res.ok) {
      return { success: false, error: "Beállítás sikertelen" };
    }

    revalidatePath("/hu/fiok/cimek");
    return { success: true };
  } catch {
    return { success: false, error: "Hiba történt" };
  }
}

/**
 * Helper to clear all default flags before setting a new default.
 */
async function clearDefaultAddresses(jwt: string): Promise<void> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/shipping-addresses?filters[isDefault][$eq]=true`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );

    if (!res.ok) return;

    const json = await res.json();
    const addresses = json.data || [];

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
    // Ignore errors in cleanup
  }
}
