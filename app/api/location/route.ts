import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter required' },
      { status: 400 }
    );
  }

  try {
    const locations = await searchLocations(query);
    return NextResponse.json({
      success: true,
      locations,
    });
  } catch (error: any) {
    console.error('Location search error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
