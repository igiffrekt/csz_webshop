const hufFormatter = new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency: 'HUF',
  maximumFractionDigits: 0,
})

export function formatPrice(amount: number): string {
  return hufFormatter.format(amount)
}

/**
 * Get image URL - handles Sanity image URLs and fallbacks
 */
export function getImageUrl(url: string | undefined): string {
  if (!url) return '/placeholder.svg'
  if (url.startsWith('http')) return url
  return url
}

/**
 * Extract slug string from Sanity slug object or plain string
 */
export function getSlugString(slug: { current: string } | string | undefined | null): string {
  if (!slug) return ''
  if (typeof slug === 'string') return slug
  return slug.current
}

/**
 * Format a date in Hungarian locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Strip HTML tags from a string
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Format order status in Hungarian
 */
export function formatOrderStatus(status: string): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  const statuses: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Fizetésre vár', variant: 'outline' },
    paid: { label: 'Fizetve', variant: 'secondary' },
    processing: { label: 'Feldolgozás alatt', variant: 'secondary' },
    shipped: { label: 'Szállítás alatt', variant: 'default' },
    delivered: { label: 'Kiszállítva', variant: 'default' },
    cancelled: { label: 'Lemondva', variant: 'destructive' },
    refunded: { label: 'Visszafizetve', variant: 'destructive' },
  }

  return statuses[status] || { label: status, variant: 'outline' }
}
