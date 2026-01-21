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
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;
  const baseUrl =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  return `${baseUrl}${url}`;
}

/**
 * Format a date in Hungarian locale
 * @param dateString - ISO date string
 * @returns Formatted date string, e.g. "2026. januar 20."
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format order status in Hungarian
 * @param status - Order status string
 * @returns Object with Hungarian label and Badge variant
 */
export function formatOrderStatus(status: string): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  const statuses: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Fizetesre var', variant: 'outline' },
    paid: { label: 'Fizetve', variant: 'secondary' },
    processing: { label: 'Feldolgozas alatt', variant: 'secondary' },
    shipped: { label: 'Szallitas alatt', variant: 'default' },
    delivered: { label: 'Kiszallitva', variant: 'default' },
    cancelled: { label: 'Lemondva', variant: 'destructive' },
    refunded: { label: 'Visszafizetve', variant: 'destructive' },
  };

  return statuses[status] || { label: status, variant: 'outline' };
}
