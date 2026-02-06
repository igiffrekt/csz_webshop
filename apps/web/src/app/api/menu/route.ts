import { NextResponse } from 'next/server'
import { getMenuItems } from '@/lib/sanity-queries'

export async function GET() {
  try {
    const menuItems = await getMenuItems()
    return NextResponse.json({ data: menuItems || [] })
  } catch (error) {
    console.error('Failed to fetch menu:', error)
    return NextResponse.json({ data: [] })
  }
}
