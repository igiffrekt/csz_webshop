import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/sanity-queries'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || ''

  if (!query.trim()) {
    return NextResponse.json({ data: [] })
  }

  try {
    const { data } = await getProducts({ search: query, pageSize: 10 })
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Product search failed:', error)
    return NextResponse.json({ data: [] })
  }
}
