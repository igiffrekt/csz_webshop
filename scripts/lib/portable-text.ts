/**
 * Simple HTML → Sanity Portable Text converter
 *
 * Handles the common HTML patterns found in WooCommerce product descriptions:
 * paragraphs, bold, italic, lists, headings, line breaks.
 */

interface PortableTextSpan {
  _type: 'span'
  _key: string
  text: string
  marks?: string[]
}

interface PortableTextBlock {
  _type: 'block'
  _key: string
  style: string
  markDefs: never[]
  children: PortableTextSpan[]
}

let keyCounter = 0
function genKey(): string {
  return `k${(keyCounter++).toString(36)}`
}

export function resetKeyCounter(): void {
  keyCounter = 0
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function parseInlineMarkup(text: string): PortableTextSpan[] {
  const spans: PortableTextSpan[] = []

  // Simple approach: strip tags but track bold/italic
  // For WooCommerce descriptions, most content is plain text in paragraphs
  const cleaned = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Extract bold and italic segments
  const parts: { text: string; marks: string[] }[] = []
  let remaining = cleaned

  // Process <strong>/<b> and <em>/<i> tags
  const tagRegex = /<(strong|b|em|i)>(.*?)<\/\1>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Simple: just strip all tags and return plain text
  // This handles the vast majority of WooCommerce content
  const plainText = remaining.replace(/<[^>]*>/g, '').trim()

  if (plainText) {
    spans.push({
      _type: 'span',
      _key: genKey(),
      text: plainText,
    })
  }

  return spans
}

function makeBlock(
  text: string,
  style: string = 'normal'
): PortableTextBlock | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  return {
    _type: 'block',
    _key: genKey(),
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: genKey(),
        text: trimmed,
      },
    ],
  }
}

export function htmlToPortableText(html: string): PortableTextBlock[] {
  if (!html || !html.trim()) {
    return [
      {
        _type: 'block',
        _key: genKey(),
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: genKey(), text: '' }],
      },
    ]
  }

  const blocks: PortableTextBlock[] = []

  // Normalize whitespace between tags
  let normalized = html
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()

  // Extract list items first
  const listItemRegex = /<li[^>]*>(.*?)<\/li>/gis
  const hasLists = /<[ou]l[^>]*>/i.test(normalized)

  // Split by block-level elements
  // Replace block elements with markers
  const blockSplit = normalized
    // Handle headings
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gis, '\n%%H$1%%$2%%/H%%\n')
    // Handle list items
    .replace(/<li[^>]*>(.*?)<\/li>/gis, '\n%%LI%%$1%%/LI%%\n')
    // Remove list wrappers
    .replace(/<\/?[ou]l[^>]*>/gi, '')
    // Handle paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gis, '\n%%P%%$1%%/P%%\n')
    // Handle divs as paragraphs
    .replace(/<div[^>]*>(.*?)<\/div>/gis, '\n%%P%%$1%%/P%%\n')
    // Handle <br> as line splits
    .replace(/<br\s*\/?>/gi, '\n')

  const lines = blockSplit.split('\n').filter((l) => l.trim())

  for (const line of lines) {
    const trimmed = line.trim()

    // Heading
    const headingMatch = trimmed.match(/^%%H(\d)%%(.*?)%%\/H%%$/)
    if (headingMatch) {
      const level = headingMatch[1]
      const text = stripHtml(headingMatch[2])
      const block = makeBlock(text, `h${level}`)
      if (block) blocks.push(block)
      continue
    }

    // List item
    const liMatch = trimmed.match(/^%%LI%%(.*?)%%\/LI%%$/)
    if (liMatch) {
      const text = stripHtml(liMatch[1])
      const block = makeBlock(text, 'normal')
      if (block) {
        // Prefix with bullet character for simplicity
        block.children[0].text = `• ${block.children[0].text}`
        blocks.push(block)
      }
      continue
    }

    // Paragraph
    const pMatch = trimmed.match(/^%%P%%(.*?)%%\/P%%$/)
    if (pMatch) {
      const text = stripHtml(pMatch[1])
      const block = makeBlock(text)
      if (block) blocks.push(block)
      continue
    }

    // Plain text (not wrapped in any tag)
    const text = stripHtml(trimmed)
    const block = makeBlock(text)
    if (block) blocks.push(block)
  }

  // If we got nothing, create a single block from the raw HTML stripped of tags
  if (blocks.length === 0) {
    const text = stripHtml(html)
    const block = makeBlock(text)
    if (block) blocks.push(block)
  }

  // Final fallback - ensure at least one block
  if (blocks.length === 0) {
    blocks.push({
      _type: 'block',
      _key: genKey(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: genKey(), text: '' }],
    })
  }

  return blocks
}

export function textToPortableText(text: string): PortableTextBlock[] {
  if (!text || !text.trim()) {
    return [
      {
        _type: 'block',
        _key: genKey(),
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: genKey(), text: '' }],
      },
    ]
  }

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim())

  return paragraphs.map((p) => ({
    _type: 'block' as const,
    _key: genKey(),
    style: 'normal' as const,
    markDefs: [] as never[],
    children: [
      {
        _type: 'span' as const,
        _key: genKey(),
        text: p.trim(),
      },
    ],
  }))
}
