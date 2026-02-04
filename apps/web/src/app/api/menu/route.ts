import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export async function GET() {
  try {
    // Fetch published menu items with hierarchy
    const response = await fetch(
      `${STRAPI_URL}/api/menu-items/tree`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      // If tree endpoint fails, fall back to regular list
      const listResponse = await fetch(
        `${STRAPI_URL}/api/menu-items?populate[kategoria][fields][0]=name&populate[kategoria][fields][1]=slug&populate[children][populate][kategoria][fields][0]=name&populate[children][populate][kategoria][fields][1]=slug&filters[parent][$null]=true&sort=sorrend:asc&publicationState=live`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 60 },
        }
      );

      if (!listResponse.ok) {
        return NextResponse.json({ data: [] });
      }

      const listData = await listResponse.json();
      return NextResponse.json(listData);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return NextResponse.json({ data: [] });
  }
}
