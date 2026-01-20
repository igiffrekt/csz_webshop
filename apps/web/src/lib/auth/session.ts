import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@csz/types";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is required");
}
const encodedKey = new TextEncoder().encode(secretKey);

const COOKIE_NAME = "csz-session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) return null;
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

export async function createSession(strapiResponse: {
  jwt: string;
  user: {
    id: number;
    documentId: string;
    email: string;
    username: string;
  };
}): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const sessionPayload: SessionPayload = {
    jwt: strapiResponse.jwt,
    userId: strapiResponse.user.id,
    userDocumentId: strapiResponse.user.documentId,
    email: strapiResponse.user.email,
    username: strapiResponse.user.username,
    expiresAt,
  };

  const session = await encrypt(sessionPayload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  return decrypt(session);
}

export async function updateSession(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  // Extend session if it will expire in less than 1 day
  const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (session.expiresAt < oneDayFromNow) {
    session.expiresAt = new Date(Date.now() + SESSION_DURATION);
    const encrypted = await encrypt(session);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      sameSite: "lax",
      path: "/",
    });
  }
}
