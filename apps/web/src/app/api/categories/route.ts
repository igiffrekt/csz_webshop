import { NextResponse } from 'next/server'
import { getCategories, getCategoryTree } from '@/lib/sanity-queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tree = searchParams.get('tree')

    if (tree === '1') {
      const data = await getCategoryTree()
      return NextResponse.json({ data: data || [] })
    }

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
