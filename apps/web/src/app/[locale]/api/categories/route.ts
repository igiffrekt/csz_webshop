import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/sanity-queries';

// Handle locale-prefixed API route for categories
// This is needed because next-intl routes all paths through [locale]
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { data: [], meta: { pagination: { page: 1, pageSize: 100, pageCount: 0, total: 0 } } },
      { status: 200 }
    );
  }
}
