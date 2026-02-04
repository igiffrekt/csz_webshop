import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { SessionPayload } from "@csz/types";

export type { SessionPayload };

interface AuthResult {
  isAuth: true;
  session: SessionPayload;
}

interface UnauthResult {
  isAuth: false;
  session: null;
}

/**
 * Verify session without redirecting. Use for conditional rendering.
 * Result is cached per request via React cache().
 */
export const verifySession = cache(
  async (): Promise<AuthResult | UnauthResult> => {
    const session = await getSession();

    if (!session || session.expiresAt < new Date()) {
      return { isAuth: false, session: null };
    }

    return { isAuth: true, session };
  }
);

/**
 * Require authentication, redirect to login if not authenticated.
 * Use in pages/layouts that require login.
 *
 * @param redirectTo - Optional URL to redirect back to after login
 */
export async function requireAuth(redirectTo?: string): Promise<SessionPayload> {
  const { isAuth, session } = await verifySession();

  if (!isAuth) {
    if (redirectTo) {
      redirect(`/hu/auth/bejelentkezes?redirect=${encodeURIComponent(redirectTo)}`);
    } else {
      redirect("/hu/auth/bejelentkezes");
    }
  }

  return session;
}

/**
 * Get current user ID if authenticated, null otherwise.
 * Useful for optional personalization.
 */
export async function getCurrentUserId(): Promise<number | null> {
  const { isAuth, session } = await verifySession();
  return isAuth ? session.userId : null;
}

/**
 * Get Strapi JWT for authenticated API calls.
 * Returns null if not authenticated.
 */
export async function getStrapiJwt(): Promise<string | null> {
  const { isAuth, session } = await verifySession();
  return isAuth ? session.jwt : null;
}
