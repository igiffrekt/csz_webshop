# Phase 5: Authentication & User Accounts - Research

**Researched:** 2026-01-20
**Domain:** Authentication, Session Management, User Profiles, Password Reset, Order History
**Confidence:** HIGH

## Summary

This phase implements complete user authentication and account management for the CSZ Webshop. The research evaluates authentication approaches and recommends using Strapi's built-in Users & Permissions plugin for user storage combined with a custom session layer in Next.js using httpOnly cookies. This approach leverages Strapi's battle-tested authentication endpoints while maintaining control over session management in the Next.js App Router.

The architecture uses Strapi 5's Users & Permissions plugin as the authentication backend (JWT issuance, password reset emails), with the Fastify API backend handling authenticated business logic (order history queries). The Next.js frontend manages sessions via encrypted httpOnly cookies using the `jose` library, following Next.js official security recommendations. Auth.js (NextAuth v5) was considered but adds unnecessary complexity when Strapi already provides complete authentication functionality.

**Primary recommendation:** Use Strapi's Users & Permissions plugin endpoints directly (`/api/auth/local`, `/api/auth/local/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`), store Strapi JWT in encrypted httpOnly cookies managed by Next.js, create UserProfile and ShippingAddress content types in Strapi with user relations, and extend the user model with company/VAT fields for B2B invoicing.

---

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Strapi Users & Permissions | Built-in | User authentication, JWT, password reset | Native to Strapi 5, battle-tested, email integration |
| jose | 5.x | JWT encryption/decryption in Next.js | Recommended by Next.js docs, Edge-compatible |
| @strapi/provider-email-nodemailer | 5.x | Email sending for password reset | Official Strapi plugin for SMTP |
| zod | 3.x | Form validation (already in stack) | Type-safe validation, used in existing forms |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| bcrypt | (Strapi internal) | Password hashing | Handled by Strapi - never implement manually |
| server-only | npm package | Prevent client import of session utils | Mark session helpers as server-side only |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Strapi Users & Permissions | Auth.js (NextAuth v5) | Auth.js adds complexity; Strapi already has auth |
| jose for sessions | iron-session | jose is more flexible, iron-session simpler but less control |
| Direct Strapi JWT | Auth.js + Strapi adapter | No official adapter; custom integration complex |
| Strapi email | SendGrid direct | Nodemailer works with any SMTP, including SendGrid |

**Installation:**
```bash
# In apps/cms
pnpm add @strapi/provider-email-nodemailer

# In apps/web
pnpm add jose server-only
```

---

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
  lib/
    auth/
      session.ts           # JWT encrypt/decrypt with jose
      dal.ts               # Data Access Layer - verifySession
      actions.ts           # Server Actions: login, register, logout
  middleware.ts            # Route protection
  app/
    [locale]/
      fiok/                # Account pages (Hungarian)
        page.tsx           # Account dashboard
        profil/
          page.tsx         # Profile settings
        cimek/
          page.tsx         # Address management
        rendelesek/
          page.tsx         # Order history
          [id]/
            page.tsx       # Order details
      auth/
        bejelentkezes/     # Login page
          page.tsx
        regisztracio/      # Registration page
          page.tsx
        elfelejtett-jelszo/ # Forgot password
          page.tsx
        jelszo-visszaallitas/ # Reset password (with token)
          page.tsx

apps/cms/src/
  api/
    shipping-address/      # NEW: ShippingAddress content type
      content-types/
        shipping-address/
          schema.json
    user-profile/          # Alternative: extend user inline

apps/api/src/
  routes/
    auth/
      me.ts               # GET /auth/me - current user info
    orders/
      history.ts          # GET /orders - user's order history
  plugins/
    auth.ts               # Fastify plugin for JWT verification
```

### Pattern 1: Session Management with jose (Next.js)
**What:** Encrypt Strapi JWT and store in httpOnly cookie
**When to use:** All authenticated requests in Next.js
**Example:**
```typescript
// lib/auth/session.ts
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET!;
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  jwt: string;           // Strapi JWT token
  userId: number;
  userDocumentId: string;
  email: string;
  username: string;
  expiresAt: Date;
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(strapiResponse: {
  jwt: string;
  user: { id: number; documentId: string; email: string; username: string };
}): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await encrypt({
    jwt: strapiResponse.jwt,
    userId: strapiResponse.user.id,
    userDocumentId: strapiResponse.user.documentId,
    email: strapiResponse.user.email,
    username: strapiResponse.user.username,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  return decrypt(session);
}
```

### Pattern 2: Data Access Layer (DAL)
**What:** Centralized session verification for server components
**When to use:** Any server component or route handler needing auth
**Example:**
```typescript
// lib/auth/dal.ts
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<{
  isAuth: true;
  session: SessionPayload;
} | {
  isAuth: false;
  session: null;
}> => {
  const session = await getSession();

  if (!session || new Date(session.expiresAt) < new Date()) {
    return { isAuth: false, session: null };
  }

  return { isAuth: true, session };
});

export const requireAuth = cache(async (): Promise<SessionPayload> => {
  const { isAuth, session } = await verifySession();

  if (!isAuth) {
    redirect("/auth/bejelentkezes");
  }

  return session!;
});
```

### Pattern 3: Server Actions for Auth
**What:** Login, register, logout via Server Actions
**When to use:** Form submissions for authentication
**Example:**
```typescript
// lib/auth/actions.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, deleteSession } from "./session";

const STRAPI_URL = process.env.STRAPI_URL!;

const loginSchema = z.object({
  identifier: z.string().email("Ervenytelen email cim"),
  password: z.string().min(6, "A jelszo legalabb 6 karakter"),
});

export interface AuthState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

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

  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedFields.data),
  });

  if (!res.ok) {
    const error = await res.json();
    return {
      error: error.error?.message || "Hibas email cim vagy jelszo",
    };
  }

  const data = await res.json();
  await createSession(data);

  redirect("/fiok");
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/");
}

export async function registerAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const registerSchema = z.object({
    username: z.string().min(3, "Legalabb 3 karakter"),
    email: z.string().email("Ervenytelen email cim"),
    password: z.string().min(6, "Legalabb 6 karakter"),
    passwordConfirm: z.string(),
  }).refine(data => data.password === data.passwordConfirm, {
    message: "A jelszavak nem egyeznek",
    path: ["passwordConfirm"],
  });

  const validatedFields = registerSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { passwordConfirm, ...registerData } = validatedFields.data;

  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registerData),
  });

  if (!res.ok) {
    const error = await res.json();
    return {
      error: error.error?.message || "Regisztracio sikertelen",
    };
  }

  const data = await res.json();
  await createSession(data);

  redirect("/fiok");
}
```

### Pattern 4: Next.js Middleware for Route Protection
**What:** Redirect unauthenticated users from protected routes
**When to use:** All requests to protected routes
**Example:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session";

const protectedRoutes = ["/fiok", "/penztar"];
const authRoutes = ["/auth/bejelentkezes", "/auth/regisztracio"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip locale prefix for matching
  const pathWithoutLocale = path.replace(/^\/(hu|en)/, "");

  const isProtectedRoute = protectedRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route =>
    pathWithoutLocale.startsWith(route)
  );

  const session = req.cookies.get("session")?.value;
  const payload = await decrypt(session);
  const isAuthenticated = !!payload?.jwt;

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/bejelentkezes", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/fiok", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

### Pattern 5: ShippingAddress Content Type Schema
**What:** Strapi collection type for user addresses
**When to use:** User address management (ACCT-04)
**Example:**
```json
{
  "kind": "collectionType",
  "collectionName": "shipping_addresses",
  "info": {
    "singularName": "shipping-address",
    "pluralName": "shipping-addresses",
    "displayName": "Shipping Address"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "label": {
      "type": "string",
      "required": true,
      "maxLength": 100
    },
    "recipientName": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "street": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "city": {
      "type": "string",
      "required": true,
      "maxLength": 100
    },
    "postalCode": {
      "type": "string",
      "required": true,
      "maxLength": 20
    },
    "country": {
      "type": "string",
      "default": "Magyarorszag",
      "maxLength": 100
    },
    "phone": {
      "type": "string",
      "maxLength": 50
    },
    "isDefault": {
      "type": "boolean",
      "default": false
    },
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user",
      "inversedBy": "shippingAddresses"
    }
  }
}
```

### Pattern 6: Extend User Model for Company/VAT
**What:** Add company fields directly to Strapi user model
**When to use:** B2B customer support (ACCT-05)
**Example:**
```json
// apps/cms/src/extensions/users-permissions/content-types/user/schema.json
// Extend the default user schema with additional fields
{
  "attributes": {
    "firstName": {
      "type": "string",
      "maxLength": 100
    },
    "lastName": {
      "type": "string",
      "maxLength": 100
    },
    "phone": {
      "type": "string",
      "maxLength": 50
    },
    "companyName": {
      "type": "string",
      "maxLength": 255
    },
    "vatNumber": {
      "type": "string",
      "maxLength": 50
    },
    "shippingAddresses": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::shipping-address.shipping-address",
      "mappedBy": "user"
    },
    "orders": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::order.order",
      "mappedBy": "user"
    }
  }
}
```

### Pattern 7: Fastify JWT Verification Plugin
**What:** Verify Strapi JWT in Fastify API routes
**When to use:** Protected API endpoints in Fastify backend
**Example:**
```typescript
// apps/api/src/plugins/auth.ts
import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

declare module "fastify" {
  interface FastifyRequest {
    userId?: number;
    userDocumentId?: string;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  const JWT_SECRET = process.env.JWT_SECRET!;

  fastify.decorate("verifyJWT", async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw fastify.httpErrors.unauthorized("Token required");
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      request.userId = decoded.id;

      // Optionally fetch user details from Strapi
      const userRes = await fetch(
        `${process.env.STRAPI_URL}/api/users/${decoded.id}`,
        { headers: { Authorization: authHeader } }
      );

      if (userRes.ok) {
        const user = await userRes.json();
        request.userDocumentId = user.documentId;
      }
    } catch {
      throw fastify.httpErrors.unauthorized("Invalid token");
    }
  });
}

export default fp(authPlugin);
```

### Anti-Patterns to Avoid
- **Storing JWT in localStorage:** Vulnerable to XSS attacks. Use httpOnly cookies.
- **Using Auth.js with Strapi:** Adds unnecessary complexity when Strapi has auth.
- **Implementing password hashing:** Strapi handles this. Never implement yourself.
- **Checking auth only in middleware:** Always verify session at data access layer too.
- **Storing sensitive user data in JWT payload:** JWT can be decoded (not encrypted).
- **Skipping CSRF protection on custom forms:** Server Actions handle this automatically.

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | bcrypt implementation | Strapi built-in | Timing attacks, salt management, version compatibility |
| JWT issuance | Custom JWT signing | Strapi `/api/auth/local` | Token expiration, refresh, revocation complexity |
| Password reset flow | Email link generation | Strapi `/api/auth/forgot-password` | Secure token generation, email templates, expiration |
| Email confirmation | Custom verification system | Strapi email confirmation | Already integrated with user lifecycle |
| Session encryption | Custom encryption | jose library | Cryptographic best practices, Edge runtime support |
| Form CSRF protection | CSRF tokens manually | Next.js Server Actions | Built-in CSRF protection in App Router |
| Rate limiting (auth) | Custom rate limiter | Strapi built-in | koa2-ratelimit integration, configurable |

**Key insight:** Strapi's Users & Permissions plugin provides a complete, secure authentication system. The effort is in connecting it properly to Next.js sessions, not rebuilding auth from scratch.

---

## Common Pitfalls

### Pitfall 1: Storing JWT in localStorage
**What goes wrong:** XSS attack steals JWT, attacker gains full account access
**Why it happens:** Simpler than cookies, works without server-side rendering
**How to avoid:**
1. Store JWT in httpOnly cookies - JavaScript cannot access
2. Use `sameSite: "lax"` to prevent CSRF
3. Set `secure: true` in production (HTTPS only)
**Warning signs:** JWT visible in DevTools Application > Local Storage

### Pitfall 2: Relying Only on Middleware for Auth
**What goes wrong:** Data accessed without authentication if middleware bypassed
**Why it happens:** Middleware runs on Edge, database checks avoided for performance
**How to avoid:**
1. Use Data Access Layer (DAL) pattern
2. Verify session in server components/actions that access data
3. Middleware for UX redirects, DAL for security
**Warning signs:** Protected data fetched without session check in component

### Pitfall 3: Missing SESSION_SECRET Environment Variable
**What goes wrong:** Sessions fail silently, users cannot stay logged in
**Why it happens:** Works in development with hardcoded fallback, fails in production
**How to avoid:**
1. Generate with `openssl rand -base64 32`
2. Add to all environments: development, staging, production
3. Never commit to git - use environment variables
**Warning signs:** "Sign in" redirects back to login, no error message

### Pitfall 4: Password Reset Email Not Sending
**What goes wrong:** User requests reset, no email arrives
**Why it happens:** Email provider not configured, wrong sender address
**How to avoid:**
1. Configure email provider in `config/plugins.ts`
2. Set sender email to verified domain address
3. Update Reset Password URL in Strapi admin settings
4. Test with "Send test email" in Strapi admin
**Warning signs:** Test email works, forgot-password doesn't

### Pitfall 5: Strapi allowedFields Empty in v5
**What goes wrong:** Custom user fields (phone, company) rejected on registration
**Why it happens:** Strapi 5 defaults `allowedFields` to empty array (breaking change)
**How to avoid:**
1. Explicitly configure `register.allowedFields` in `config/plugins.ts`
2. Include all custom fields that should be accepted during registration
**Warning signs:** Registration succeeds but custom fields are null

### Pitfall 6: Cart Not Associated with User After Login
**What goes wrong:** Anonymous cart lost when user logs in
**Why it happens:** No cart merge logic implemented
**How to avoid:**
1. Store anonymous cart in localStorage (already done in Phase 4)
2. On login success, cart persists (localStorage unaffected by auth)
3. For server-side carts (Phase 6), implement merge on checkout
**Warning signs:** User adds items, logs in, cart appears empty

---

## Code Examples

Verified patterns from official sources:

### Strapi Email Provider Configuration (Nodemailer)
```typescript
// apps/cms/config/plugins.ts
// Source: https://docs.strapi.io/cms/features/email

export default ({ env }) => ({
  // ... existing plugins
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.mailtrap.io"),
        port: env.int("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
      },
      settings: {
        defaultFrom: env("SMTP_FROM", "noreply@csz-webshop.hu"),
        defaultReplyTo: env("SMTP_REPLY_TO", "info@csz-webshop.hu"),
      },
    },
  },
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d",
      },
      register: {
        allowedFields: ["firstName", "lastName", "phone", "companyName", "vatNumber"],
      },
      ratelimit: {
        enabled: true,
        interval: { min: 5 },
        max: 5,
      },
    },
  },
});
```

### Login Form Component
```typescript
// components/auth/LoginForm.tsx
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthState } from "@/lib/auth/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email cim</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        {state.fieldErrors?.identifier && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.identifier[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Jelszo</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Bejelentkezes..." : "Bejelentkezes"}
      </Button>
    </form>
  );
}
```

### Password Reset Flow
```typescript
// lib/auth/actions.ts (additional actions)

export async function forgotPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;

  if (!email || !z.string().email().safeParse(email).success) {
    return { error: "Ervenytelen email cim" };
  }

  const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  // Always show success (prevent email enumeration)
  return { error: undefined };
}

export async function resetPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const code = formData.get("code") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("passwordConfirmation") as string;

  if (password !== passwordConfirmation) {
    return { error: "A jelszavak nem egyeznek" };
  }

  if (password.length < 6) {
    return { error: "A jelszo legalabb 6 karakter legyen" };
  }

  const res = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });

  if (!res.ok) {
    const error = await res.json();
    return { error: error.error?.message || "Jelszo visszaallitas sikertelen" };
  }

  redirect("/auth/bejelentkezes?reset=success");
}
```

### Protected Account Page
```typescript
// app/[locale]/fiok/page.tsx
import { requireAuth } from "@/lib/auth/dal";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/actions";
import Link from "next/link";

export default async function AccountPage() {
  const session = await requireAuth();

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Fiokom</h1>

      <p className="mb-4">
        Udvozollek, {session.username}!
      </p>

      <nav className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/fiok/profil"
          className="p-4 border rounded-lg hover:bg-muted"
        >
          <h2 className="font-semibold">Profil beallitasok</h2>
          <p className="text-sm text-muted-foreground">
            Szemelyes adatok, ceg informaciok
          </p>
        </Link>

        <Link
          href="/fiok/cimek"
          className="p-4 border rounded-lg hover:bg-muted"
        >
          <h2 className="font-semibold">Szallitasi cimek</h2>
          <p className="text-sm text-muted-foreground">
            Mentett cimek kezelese
          </p>
        </Link>

        <Link
          href="/fiok/rendelesek"
          className="p-4 border rounded-lg hover:bg-muted"
        >
          <h2 className="font-semibold">Rendeleseim</h2>
          <p className="text-sm text-muted-foreground">
            Korabbi rendelesek megtekintese
          </p>
        </Link>
      </nav>

      <form action={logoutAction} className="mt-8">
        <Button variant="outline" type="submit">
          Kijelentkezes
        </Button>
      </form>
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js v4 | Auth.js v5 | 2024-2025 | Universal auth() function, better App Router support |
| localStorage JWT | httpOnly cookies | Best practice | XSS protection, server-side session access |
| getServerSession() | auth() function | Auth.js v5 | Simpler API, works everywhere |
| Custom CSRF tokens | Server Actions | Next.js 14+ | Built-in CSRF protection |
| prop drilling session | Data Access Layer | Next.js 14+ | Cache() for request deduplication |
| getToken from JWT | Encrypted session cookies | 2024+ | Full session data available server-side |

**Deprecated/outdated:**
- **NextAuth.js v4 patterns:** Use v5's auth() and handlers pattern
- **getServerSession/getToken:** Replaced by unified auth() in v5
- **Client-side only auth check:** Always verify server-side at DAL layer
- **Strapi jwtManagement: 'legacy-support':** Consider 'refresh' for new projects

---

## Open Questions

Things that couldn't be fully resolved:

1. **Order Content Type Schema**
   - What we know: Need Order content type with user relation for order history
   - What's unclear: Order will be created in Phase 6 (Checkout), exact schema depends on payment integration
   - Recommendation: Create placeholder Order content type in Phase 5 with user relation; full schema in Phase 6

2. **Email Provider for Production**
   - What we know: Nodemailer works with any SMTP; SendGrid, Mailgun are common
   - What's unclear: Which provider client prefers for production
   - Recommendation: Use Mailtrap for development/testing, add provider flexibility in configuration

3. **Session Token Refresh Strategy**
   - What we know: Strapi supports refresh tokens via jwtManagement: 'refresh'
   - What's unclear: Whether 7-day sessions are sufficient or refresh tokens needed
   - Recommendation: Start with 7-day JWT, add refresh token logic if users complain about being logged out

4. **Anonymous Cart to User Cart Merge**
   - What we know: Cart is localStorage-based, survives login/logout
   - What's unclear: Whether server-side cart needed for Phase 6 checkout
   - Recommendation: Current localStorage approach works; reassess when implementing checkout

---

## Sources

### Primary (HIGH confidence)
- [Strapi 5 Users & Permissions Documentation](https://docs.strapi.io/dev-docs/plugins/users-permissions) - Authentication endpoints, JWT, rate limiting
- [Strapi 5 Authentication Flow](https://docs.strapi.io/cms/backend-customization/examples/authentication) - JWT usage, refresh tokens
- [Strapi 5 Email Feature](https://docs.strapi.io/cms/features/email) - Email provider configuration
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - DAL pattern, middleware
- [Auth.js Protecting Routes](https://authjs.dev/getting-started/session-management/protecting) - Middleware, auth() usage
- [Auth.js Credentials Provider](https://authjs.dev/getting-started/authentication/credentials) - Third-party backend integration

### Secondary (MEDIUM confidence)
- [Strapi Email Authentication with Next.js 15 Tutorial](https://strapi.io/blog/strapi-email-and-password-authentication-with-nextjs-15-part-2) - jose session implementation
- [Next.js Security Guide 2025](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices) - CSRF, XSS, JWT best practices
- [Clerk Next.js Session Management](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues) - Session persistence troubleshooting

### Tertiary (LOW confidence)
- Auth.js GitHub discussions for Strapi integration patterns
- Community tutorials on Zustand + auth state persistence

---

## Metadata

**Confidence breakdown:**
- Authentication approach: HIGH - Official Strapi and Next.js documentation
- Session management: HIGH - Next.js official guide, jose library docs
- Email configuration: HIGH - Strapi email documentation
- User model extension: MEDIUM - Forum discussions, some v5-specific gaps
- Order history: MEDIUM - Schema patterns clear, exact implementation in Phase 6
- Security best practices: HIGH - Multiple authoritative sources agree

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable technologies)
