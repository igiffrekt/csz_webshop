"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ShippingAddress } from "@csz/types";

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
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nincs bejelentkezve" };
  }

  try {
    if (input.isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.shippingAddress.create({
      data: {
        ...input,
        country: input.country || "Magyarország",
        isDefault: input.isDefault || false,
        userId: session.user.id,
      },
    });

    revalidatePath("/hu/fiok/cimek");
    return { success: true, data: address as any };
  } catch {
    return { success: false, error: "Cím létrehozása sikertelen" };
  }
}

/**
 * Update an existing shipping address
 */
export async function updateAddressAction(
  id: string,
  input: Partial<AddressInput>
): Promise<ActionResult<ShippingAddress>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nincs bejelentkezve" };
  }

  try {
    if (input.isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.shippingAddress.update({
      where: { id },
      data: input,
    });

    revalidatePath("/hu/fiok/cimek");
    return { success: true, data: address as any };
  } catch {
    return { success: false, error: "Cím frissítése sikertelen" };
  }
}

/**
 * Delete a shipping address
 */
export async function deleteAddressAction(
  id: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nincs bejelentkezve" };
  }

  try {
    await prisma.shippingAddress.delete({ where: { id } });
    revalidatePath("/hu/fiok/cimek");
    return { success: true };
  } catch (err) {
    console.error("[deleteAddressAction] exception:", err);
    return { success: false, error: "Cím törlése sikertelen" };
  }
}

/**
 * Set an address as the default
 */
export async function setDefaultAddressAction(
  id: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nincs bejelentkezve" };
  }

  try {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    await prisma.shippingAddress.update({
      where: { id },
      data: { isDefault: true },
    });

    revalidatePath("/hu/fiok/cimek");
    return { success: true };
  } catch {
    return { success: false, error: "Beállítás sikertelen" };
  }
}
