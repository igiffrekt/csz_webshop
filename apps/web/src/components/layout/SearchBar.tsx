'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, Loader2, ArrowRight, FolderOpen } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/formatters'
import Image from 'next/image'
import Link from 'next/link'

interface SearchResult {
  products: {
    _id: string
    name: string
    slug: string
    sku: string
    basePrice: number
    compareAtPrice?: number
    isOnSale?: boolean
    image?: { url: string; alt?: string }
    categories?: { _id: string; name: string; slug: string }[]
  }[]
  categories: {
    _id: string
    name: string
    slug: string
    image?: { url: string; alt?: string }
    productCount: number
  }[]
}

interface SearchBarProps {
  className?: string
  variant?: 'default' | 'hero'
}

export function SearchBar({ className, variant = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const router = useRouter()

  const totalResults = results
    ? results.products.length + results.categories.length
    : 0

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults(null)
      setShowResults(false)
      return
    }

    // Abort previous request
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setIsSearching(true)
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`,
        { signal: abortRef.current.signal }
      )
      const data: SearchResult = await res.json()
      setResults(data)
      setShowResults(true)
      setHighlightIndex(-1)
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setResults(null)
      }
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setResults(null)
      setShowResults(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      fetchResults(query)
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, fetchResults])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const close = () => {
    setShowResults(false)
    setQuery('')
    setResults(null)
    inputRef.current?.blur()
  }

  const navigateToProduct = (categorySlug: string, productSlug: string) => {
    close()
    router.push(`/${categorySlug}/${productSlug}` as any)
  }

  const navigateToCategory = (slug: string) => {
    close()
    router.push(`/kategoriak/${slug}` as any)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      close()
      router.push(`/termekek?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || !results) return

    const items = [
      ...results.categories.map((c) => ({ type: 'category' as const, data: c })),
      ...results.products.map((p) => ({ type: 'product' as const, data: p })),
    ]

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      const item = items[highlightIndex]
      if (item.type === 'category') {
        navigateToCategory((item.data as any).slug)
      } else {
        const p = item.data as any
        const catSlug = p.categories?.[0]?.slug || 'termekek'
        navigateToProduct(catSlug, p.slug)
      }
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const isHero = variant === 'hero'

  const inputEl = (
    <div
      className={cn(
        'flex items-center justify-between border-2 border-[#030712] rounded-[100px] bg-transparent transition-all',
        isHero ? 'h-[45px] px-[30px] py-[10px]' : 'h-[45px] px-[20px]',
        isFocused && 'border-black shadow-sm'
      )}
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setIsFocused(true)
          if (results && query.trim().length >= 2) setShowResults(true)
        }}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="Keresés név, cikkszám vagy kategória alapján..."
        className={cn(
          'flex-1 bg-transparent outline-none text-black placeholder:text-gray-400 leading-[1.15]',
          isHero ? 'text-[16px]' : 'text-[14px]'
        )}
        autoComplete="off"
        role="combobox"
        aria-expanded={showResults}
        aria-haspopup="listbox"
      />

      {isSearching && (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400 mr-2 flex-shrink-0" />
      )}

      {query && !isSearching && (
        <button
          type="button"
          onClick={() => { setQuery(''); setResults(null); setShowResults(false); inputRef.current?.focus() }}
          className="p-1 hover:text-gray-600 transition-colors mr-1 flex-shrink-0"
          aria-label="Keresés törlése"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <button
        type="submit"
        className="flex items-center justify-center flex-shrink-0"
        aria-label="Keresés"
      >
        <Search className={cn('text-black', isHero ? 'h-6 w-6' : 'h-5 w-5')} />
      </button>
    </div>
  )

  const dropdown = showResults && results && (
    <div
      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[50vh] sm:max-h-[60vh] overflow-y-auto scroll-smooth"
      role="listbox"
    >
      {totalResults === 0 && !isSearching && (
        <div className="px-6 py-10 text-center">
          <p className="text-gray-400 text-sm">
            Nincs találat erre: <span className="font-medium text-gray-600">"{query}"</span>
          </p>
        </div>
      )}

      {/* Category results */}
      {results.categories.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">
            Kategóriák
          </p>
          <div className="space-y-0.5">
            {results.categories.map((cat, i) => (
              <button
                key={cat._id}
                onClick={() => navigateToCategory(cat.slug)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                  highlightIndex === i
                    ? 'bg-[#FFBB36]/10'
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.productCount} termék</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {results.categories.length > 0 && results.products.length > 0 && (
        <div className="mx-4"><div className="border-t border-gray-100" /></div>
      )}

      {/* Product results */}
      {results.products.length > 0 && (
        <div className="px-4 pt-3 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">
            Termékek
          </p>
          <div className="space-y-0.5">
            {results.products.map((product, i) => {
              const itemIndex = results.categories.length + i
              const catSlug = product.categories?.[0]?.slug || 'termekek'
              return (
                <button
                  key={product._id}
                  onClick={() => navigateToProduct(catSlug, product.slug)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                    highlightIndex === itemIndex
                      ? 'bg-[#FFBB36]/10'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                    {product.image?.url ? (
                      <Image
                        src={product.image.url}
                        alt={product.image.alt || product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Search className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-400">{product.sku}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {product.isOnSale && product.compareAtPrice ? (
                      <>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.basePrice)}
                        </p>
                        <p className="text-xs text-gray-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(product.basePrice)}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* "See all results" footer */}
      {totalResults > 0 && (
        <button
          onClick={handleSubmit as any}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
        >
          <span className="text-sm font-medium text-gray-600">
            Összes találat megtekintése
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  )

  return (
    <div ref={containerRef} className={cn('relative', isHero ? 'w-full' : 'flex-1', className)}>
      <form onSubmit={handleSubmit}>
        {inputEl}
      </form>
      {dropdown}

      {/* Backdrop */}
      {showResults && totalResults > 0 && (
        <div
          className="fixed inset-0 bg-black/20 z-[99] backdrop-blur-[1px]"
          style={{ top: containerRef.current?.getBoundingClientRect().bottom ?? 0 }}
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}
