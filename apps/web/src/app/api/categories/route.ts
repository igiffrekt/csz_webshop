import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/sanity-queries'

export async function GET() {
  try {
    const result = await getCategories()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { data: [], meta: { pagination: { page: 1, pageSize: 100, pageCount: 0, total: 0 } } },
      { status: 200 }
    )
  }
}
