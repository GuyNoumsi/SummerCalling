import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeekWeather, getMonthHistoricalData, detectSummerDays } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location') || 'Ottawa';

  try {
    // Fetch current week's weather (with caching)
    const weekData = await getCurrentWeekWeather(location);
    
    // Fetch all month data for comparison
    const monthData = await getMonthHistoricalData(location);
    
    // Detect summer days (30-min threshold for sunrise/sunset changes)
    const summerDetections = detectSummerDays(weekData, monthData);

    return NextResponse.json({
      success: true,
      location,
      weekData,
      summerDetections,
    });
  } catch (error: any) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
