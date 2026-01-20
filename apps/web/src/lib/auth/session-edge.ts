/**
 * Edge-compatible session utilities for middleware.
 * This module can be imported in Next.js middleware (Edge runtime).
 *
 * For server-side session operations, use session.ts instead.
 */
import { jwtVerify } from "jose";
import type { SessionPayload } from "@csz/types";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

/**
 * Decrypt session token in Edge runtime.
 * Returns null if session is invalid or missing.
 */
export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session || !encodedKey) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey);
    return {
      ...payload,
      expiresAt: new Date(payload.expiresAt as string),
    } as SessionPayload;
  } catch {
    return null;
  }
}
