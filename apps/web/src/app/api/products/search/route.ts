import { NextRequest, NextResponse } from 'next/server'
import { instantSearch } from '@/lib/sanity-queries'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || ''

  if (!query.trim() || query.trim().length < 2) {
    return NextResponse.json({ products: [], categories: [] })
  }

  try {
    const results = await instantSearch(query.trim())
    return NextResponse.json(results)
  } catch (error) {
    console.error('Instant search failed:', error)
    return NextResponse.json({ products: [], categories: [] })
  }
}
