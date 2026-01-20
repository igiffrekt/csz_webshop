const hufFormatter = new Intl.NumberFormat("hu-HU", {
  style: "currency",
  currency: "HUF",
  maximumFractionDigits: 0,
});

/**
 * Format a price in Hungarian Forints (HUF)
 * @param amount - Price in HUF (integer, no decimals)
 * @returns Formatted price string, e.g. "15 900 Ft"
 */
export function formatPrice(amount: number): string {
  return hufFormatter.format(amount);
}

/**
 * Get full URL for Strapi media files
 * @param url - Relative or absolute URL from Strapi
 * @returns Full URL with Strapi base URL prepended if needed
 */
export function getStrapiMediaUrl(url: string | undefined): string {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  const baseUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  return `${baseUrl}${url}`;
}

/**
 * Format a date in Hungarian locale
 * @param dateString - ISO date string
 * @returns Formatted date string, e.g. "2026. január 20."
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
