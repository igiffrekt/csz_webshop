import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/api';

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
