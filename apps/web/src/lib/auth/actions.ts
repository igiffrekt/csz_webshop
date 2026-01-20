"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSession, deleteSession, getSession } from "./session";
import type { User } from "@csz/types";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

// Validation schemas
const loginSchema = z.object({
  identifier: z.string().email("Érvénytelen e-mail cím"),
  password: z.string().min(6, "A jelszó legalább 6 karakter"),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "A felhasználónév legalább 3 karakter"),
    email: z.string().email("Érvénytelen e-mail cím"),
    password: z.string().min(6, "A jelszó legalább 6 karakter"),
    passwordConfirm: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "A jelszavak nem egyeznek",
    path: ["passwordConfirm"],
  });

const forgotPasswordSchema = z.object({
  email: z.string().email("Érvénytelen e-mail cím"),
});

const resetPasswordSchema = z
  .object({
    code: z.string().min(1, "Hiányzik a visszaállítási kód"),
    password: z.string().min(6, "A jelszó legalább 6 karakter"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "A jelszavak nem egyeznek",
    path: ["passwordConfirmation"],
  });

// Auth state returned from actions
export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * Login with email and password
 */
export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = loginSchema.safeParse({
    identifier: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedFields.data),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error?.message || "Hibás e-mail cím vagy jelszó",
      };
    }

    const data = await res.json();
    await createSession(data);
  } catch {
    return {
      error: "Hiba történt a bejelentkezés során. Próbáld újra később.",
    };
  }

  // Get redirect URL from form or default to account page
  const redirectTo = formData.get("redirectTo") as string;
  redirect(redirectTo || "/hu/fiok");
}

/**
 * Register new account
 */
export async function registerAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = registerSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    phone: formData.get("phone") || undefined,
    companyName: formData.get("companyName") || undefined,
    vatNumber: formData.get("vatNumber") || undefined,
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Remove passwordConfirm before sending to Strapi
  const { passwordConfirm, ...registerData } = validatedFields.data;

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    if (!res.ok) {
      const error = await res.json();
      // Handle common Strapi registration errors
      const message = error.error?.message || "";
      if (message.includes("Email") && message.includes("taken")) {
        return { error: "Ez az e-mail cím már regisztrálva van" };
      }
      if (message.includes("Username") && message.includes("taken")) {
        return { error: "Ez a felhasználónév már foglalt" };
      }
      return {
        error: error.error?.message || "Regisztráció sikertelen",
      };
    }

    const data = await res.json();
    await createSession(data);
  } catch {
    return {
      error: "Hiba történt a regisztráció során. Próbáld újra később.",
    };
  }

  redirect("/hu/fiok");
}

/**
 * Logout - delete session and redirect to home
 */
export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/hu");
}

/**
 * Request password reset email
 */
export async function forgotPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedFields.data),
    });

    // Always show success to prevent email enumeration
    // Even if email doesn't exist, don't reveal that
    if (!res.ok) {
      const error = await res.json();
      // Log error but don't expose to user
      console.error("Forgot password error:", error);
    }
  } catch (error) {
    console.error("Forgot password error:", error);
  }

  // Always return success to prevent email enumeration
  return {
    success: true,
  };
}

/**
 * Reset password with code from email
 */
export async function resetPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = resetPasswordSchema.safeParse({
    code: formData.get("code"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const res = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validatedFields.data),
    });

    if (!res.ok) {
      const error = await res.json();
      const message = error.error?.message || "";
      if (message.includes("code") || message.includes("invalid")) {
        return { error: "Érvénytelen vagy lejárt visszaállítási link" };
      }
      return {
        error: error.error?.message || "Jelszó visszaállítás sikertelen",
      };
    }
  } catch {
    return {
      error: "Hiba történt. Próbáld újra később.",
    };
  }

  redirect("/hu/auth/bejelentkezes?reset=success");
}

// Schema for profile updates
const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  companyName: z.string().max(255).optional(),
  vatNumber: z.string().max(50).optional(),
});

/**
 * Update user profile information
 */
export async function updateProfileAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  // Get current session to get JWT for authenticated request
  const session = await getSession();
  if (!session) {
    return { error: "Nincs bejelentkezve" };
  }

  const validatedFields = updateProfileSchema.safeParse({
    firstName: formData.get("firstName") || undefined,
    lastName: formData.get("lastName") || undefined,
    phone: formData.get("phone") || undefined,
    companyName: formData.get("companyName") || undefined,
    vatNumber: formData.get("vatNumber") || undefined,
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Update user via custom profile API
    const res = await fetch(`${STRAPI_URL}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify(validatedFields.data),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error?.message || "Profil frissítése sikertelen",
      };
    }

    // Revalidate the profile page to show updated data
    revalidatePath("/[locale]/fiok/profil", "page");

    return { success: true };
  } catch {
    return {
      error: "Hiba történt a profil frissítése során. Próbáld újra később.",
    };
  }
}

/**
 * Get current user's full profile from Strapi
 */
export async function getCurrentUserProfile(): Promise<{
  user: User | null;
  error?: string;
}> {
  const session = await getSession();
  if (!session) {
    return { user: null, error: "Nincs bejelentkezve" };
  }

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/profile/me`,
      {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { user: null, error: "Profil betöltése sikertelen" };
    }

    const user = await res.json();
    return { user };
  } catch {
    return { user: null, error: "Hiba történt" };
  }
}
