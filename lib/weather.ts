import { prisma } from './prisma';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export interface WeatherData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  date: Date;
  tempMax: number;
  tempMin: number;
  sunrise: Date;
  sunset: Date;
  description: string;
  createdAt: Date;
}

export interface SummerDayDetection {
  date: Date;
  isLaterSunset: boolean;
  isEarlierSunrise: boolean;
  sunsetDiffMinutes?: number;
  sunriseDiffMinutes?: number;
}

/**
 * Geocode a location name to coordinates using OpenWeatherMap Geocoding API
 */
export async function geocodeLocation(locationName: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(locationName)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) return null;
  
  const data = await response.json();
  if (!data || data.length === 0) return null;
  
  return {
    lat: data[0].lat,
    lon: data[0].lon,
    name: data[0].name,
  };
}

/**
 * Search for locations using OpenWeatherMap Geocoding API
 */
export async function searchLocations(query: string): Promise<Array<{ name: string; country: string; state?: string; lat: number; lon: number }>> {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) return [];
  
  const data = await response.json();
  return data.map((item: any) => ({
    name: item.name,
    country: item.country,
    state: item.state,
    lat: item.lat,
    lon: item.lon,
  }));
}

/**
 * Fetch 5-day weather forecast from OpenWeatherMap API 2.5 (free tier)
 */
async function fetchForecastFromAPI(lat: number, lon: number): Promise<any> {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  
  if (!OPENWEATHER_API_KEY) {
    console.error("❌ OPENWEATHER_API_KEY is missing!");
    throw new Error("OPENWEATHER_API_KEY is missing");
  }

  console.log(`Fetching forecast for ${lat}, ${lon}`);
  
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Add revalidation
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`API Error Body: ${text}`);
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }
    
    const text = await response.text();
    if (!text) {
        console.error("API returned empty body for forecast");
        throw new Error("API returned empty body");
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON for forecast:", text.substring(0, 100));
        throw e;
    }
  } catch (error) {
    console.error("Fetch error in forecast:", error);
    throw error;
  }
}

/**
 * Fetch current weather (for today's data including sunrise/sunset)
 */
async function fetchCurrentWeatherFromAPI(lat: number, lon: number): Promise<any> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  
  console.log(`Fetching current weather for ${lat}, ${lon}`);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }
    
    const text = await response.text();
    if (!text) {
        console.error("API returned empty body for current weather");
        throw new Error("API returned empty body");
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON for current weather:", text.substring(0, 100));
        throw e;
    }
  } catch (error) {
      console.error("Fetch error in current weather:", error);
      throw error;
  }
}

/**
 * Get current week's weather data (7 days from today)
 */
export async function getCurrentWeekWeather(location: string): Promise<WeatherData[]> {
  // First, geocode the location
  const coords = await geocodeLocation(location);
  if (!coords) {
    throw new Error(`Location not found: ${location}`);
  }

  const now = new Date();
  const weekStart = startOfDay(now);
  const weekEnd = endOfDay(new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)); // 7 days from now

  // Check if we have cached data less than 5 hours old
  const cachedData = await prisma.weatherData.findMany({
    where: {
      location: coords.name,
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
      createdAt: {
        gte: new Date(Date.now() - CACHE_DURATION_MS),
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // If we have fresh cached data for all 7 days, return it
  if (cachedData.length >= 7) {
    return cachedData;
  }

  // Otherwise, fetch fresh data from the API
  // Free tier gives us 5-day forecast + current weather
  const [currentWeather, forecast] = await Promise.all([
    fetchCurrentWeatherFromAPI(coords.lat, coords.lon),
    fetchForecastFromAPI(coords.lat, coords.lon),
  ]);

  // Process forecast data - group by day and get max/min temps
  const dailyData = new Map<string, any>();
  
  // Add today's data from current weather
  const today = startOfDay(new Date());
  const todayKey = today.toISOString().split('T')[0];
  dailyData.set(todayKey, {
    date: today,
    tempMax: currentWeather.main.temp_max,
    tempMin: currentWeather.main.temp_min,
    sunrise: new Date(currentWeather.sys.sunrise * 1000),
    sunset: new Date(currentWeather.sys.sunset * 1000),
    description: currentWeather.weather[0].description,
  });

  // Process 5-day forecast (3-hour intervals)
  for (const item of forecast.list) {
    const date = startOfDay(new Date(item.dt * 1000));
    const dateKey = date.toISOString().split('T')[0];
    
    // Skip if we already have 7 days
    const daysSinceToday = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceToday >= 7) continue;
    
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, {
        date: date,
        tempMax: item.main.temp_max,
        tempMin: item.main.temp_min,
        sunrise: item.sys?.sunrise ? new Date(item.sys.sunrise * 1000) : null,
        sunset: item.sys?.sunset ? new Date(item.sys.sunset * 1000) : null,
        description: item.weather[0].description,
      });
    } else {
      // Update max/min temps for the day
      const existing = dailyData.get(dateKey);
      existing.tempMax = Math.max(existing.tempMax, item.main.temp_max);
      existing.tempMin = Math.min(existing.tempMin, item.main.temp_min);
    }
  }

  // For days without sunrise/sunset (forecast doesn't include it), estimate based on today
  const todayData = dailyData.get(todayKey);
  if (todayData) {
    const sunriseHour = todayData.sunrise.getHours();
    const sunriseMinute = todayData.sunrise.getMinutes();
    const sunsetHour = todayData.sunset.getHours();
    const sunsetMinute = todayData.sunset.getMinutes();

    for (const [key, data] of dailyData.entries()) {
      if (!data.sunrise || !data.sunset) {
        // Estimate: sunrise ~2 min earlier per day, sunset ~2 min later per day (approximation)
        const daysDiff = Math.floor((data.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const estimatedSunrise = new Date(data.date);
        estimatedSunrise.setHours(sunriseHour, sunriseMinute - (daysDiff * 2), 0, 0);
        
        const estimatedSunset = new Date(data.date);
        estimatedSunset.setHours(sunsetHour, sunsetMinute + (daysDiff * 2), 0, 0);
        
        data.sunrise = estimatedSunrise;
        data.sunset = estimatedSunset;
      }
    }
  }

  // Convert to array and store in database
  const weatherRecords: WeatherData[] = [];
  const sortedDays = Array.from(dailyData.values()).sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const dayData of sortedDays.slice(0, 7)) { // Ensure only 7 days
    const existing = await prisma.weatherData.findUnique({
      where: {
        location_date: {
          location: coords.name,
          date: dayData.date,
        },
      },
    });

    let record;
    if (existing) {
      record = await prisma.weatherData.update({
        where: { id: existing.id },
        data: {
          tempMax: dayData.tempMax,
          tempMin: dayData.tempMin,
          sunrise: dayData.sunrise,
          sunset: dayData.sunset,
          description: dayData.description,
        },
      });
    } else {
      record = await prisma.weatherData.create({
        data: {
          location: coords.name,
          latitude: coords.lat,
          longitude: coords.lon,
          date: dayData.date,
          tempMax: dayData.tempMax,
          tempMin: dayData.tempMin,
          sunrise: dayData.sunrise,
          sunset: dayData.sunset,
          description: dayData.description,
        },
      });
    }
    
    weatherRecords.push(record);
  }

  return weatherRecords;
}

/**
 * Get all weather data for the current month for a location
 */
export async function getMonthHistoricalData(location: string): Promise<WeatherData[]> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return prisma.weatherData.findMany({
    where: {
      location,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
}

/**
 * Detect summer days by comparing sunrise/sunset times
 * A day is marked if:
 * - Sunset is ≥30 min later than any previous day in the month
 * - Sunrise is ≥30 min earlier than any previous day in the month
 */
export function detectSummerDays(currentWeekData: WeatherData[], monthData: WeatherData[]): SummerDayDetection[] {
  const THRESHOLD_MINUTES = 30;
  const detections: SummerDayDetection[] = [];

  for (const currentDay of currentWeekData) {
    // Get all days before this one in the month
    const previousDays = monthData.filter(d => d.date < currentDay.date);
    
    if (previousDays.length === 0) {
      // First day of the month, nothing to compare to
      detections.push({
        date: currentDay.date,
        isLaterSunset: false,
        isEarlierSunrise: false,
      });
      continue;
    }

    // Helper function to get time of day in minutes since midnight
    const getTimeInMinutes = (date: Date): number => {
      return date.getHours() * 60 + date.getMinutes();
    };

    // Find the latest sunset and earliest sunrise TIME from previous days (not including date)
    let latestSunsetMinutes = getTimeInMinutes(previousDays[0].sunset);
    let earliestSunriseMinutes = getTimeInMinutes(previousDays[0].sunrise);
    
    for (const prevDay of previousDays) {
      const prevSunsetMinutes = getTimeInMinutes(prevDay.sunset);
      const prevSunriseMinutes = getTimeInMinutes(prevDay.sunrise);
      
      if (prevSunsetMinutes > latestSunsetMinutes) {
        latestSunsetMinutes = prevSunsetMinutes;
      }
      if (prevSunriseMinutes < earliestSunriseMinutes) {
        earliestSunriseMinutes = prevSunriseMinutes;
      }
    }

    // Calculate differences in minutes (comparing time-of-day only)
    const currentSunsetMinutes = getTimeInMinutes(currentDay.sunset);
    const currentSunriseMinutes = getTimeInMinutes(currentDay.sunrise);
    
    const sunsetDiffMinutes = currentSunsetMinutes - latestSunsetMinutes;
    const sunriseDiffMinutes = earliestSunriseMinutes - currentSunriseMinutes;

    detections.push({
      date: currentDay.date,
      isLaterSunset: sunsetDiffMinutes >= THRESHOLD_MINUTES,
      isEarlierSunrise: sunriseDiffMinutes >= THRESHOLD_MINUTES,
      sunsetDiffMinutes: sunsetDiffMinutes > 0 ? sunsetDiffMinutes : undefined,
      sunriseDiffMinutes: sunriseDiffMinutes > 0 ? sunriseDiffMinutes : undefined,
    });
  }

  return detections;
}
