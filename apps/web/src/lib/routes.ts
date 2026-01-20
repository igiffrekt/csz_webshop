/**
 * Centralized route constants for the application.
 * Use these instead of hardcoding route strings throughout the codebase.
 */

export const ROUTES = {
  // Public pages
  home: "/",
  products: "/termekek",
  categories: "/kategoriak",

  // Auth pages
  auth: {
    login: "/auth/bejelentkezes",
    register: "/auth/regisztracio",
    forgotPassword: "/auth/elfelejtett-jelszo",
    resetPassword: "/auth/jelszo-visszaallitas",
  },

  // Protected account pages
  account: {
    dashboard: "/fiok",
    profile: "/fiok/profil",
    addresses: "/fiok/cimek",
    orders: "/fiok/rendelesek",
    orderDetail: (id: string) => `/fiok/rendelesek/${id}` as const,
  },

  // Checkout (protected)
  checkout: "/penztar",
} as const;

/**
 * Route patterns for middleware matching (without locale prefix)
 */
export const PROTECTED_ROUTES = [
  ROUTES.account.dashboard,
  ROUTES.checkout,
] as const;

export const AUTH_ROUTES = [
  ROUTES.auth.login,
  ROUTES.auth.register,
  ROUTES.auth.forgotPassword,
] as const;

/**
 * API routes (no locale prefix)
 */
export const API_ROUTES = {
  addresses: "/api/addresses",
  addressSetDefault: "/api/addresses/set-default",
} as const;
