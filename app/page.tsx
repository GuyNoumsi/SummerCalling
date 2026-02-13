'use client';

import { useState, useEffect } from 'react';
import LocationSelector from '@/components/LocationSelector';
import WeatherCard from '@/components/WeatherCard';
import TemperatureChart from '@/components/TemperatureChart';
import SunChart from '@/components/SunChart';
import SummerAlert from '@/components/SummerAlert';

interface WeatherData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  description: string;
  createdAt: string;
}

interface SummerDetection {
  date: string;
  isLaterSunset: boolean;
  isEarlierSunrise: boolean;
  sunsetDiffMinutes?: number;
  sunriseDiffMinutes?: number;
}

export default function Home() {
  const [location, setLocation] = useState('Ottawa');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [summerDetections, setSummerDetections] = useState<SummerDetection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
      const data = await response.json();

      if (data.success) {
        setWeatherData(data.weekData);
        setSummerDetections(data.summerDetections);
      } else {
        setError(data.error || 'Failed to fetch weather data');
      }
    } catch (err: any) {
      setError('Network error. Please check your connection.');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
  };

  // Merge weather data with summer detections
  const enrichedWeatherData = weatherData.map((weather, index) => ({
    ...weather,
    ...(summerDetections[index] || {}),
  }));

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Summer Calling 🌅
          </h1>
          <p className="text-white/90 text-xl max-w-2xl mx-auto">
            Track weather patterns and discover when summer days are arriving
          </p>
        </div>

        {/* Location Selector */}
        <div className="flex justify-center mb-12">
          <LocationSelector 
            defaultLocation={location} 
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="glass rounded-3xl p-8">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">Loading weather data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="glass rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-white text-2xl font-bold mb-2">Oops!</h2>
              <p className="text-white/80">{error}</p>
              <button
                onClick={fetchWeatherData}
                className="mt-6 px-6 py-3 glass-hover rounded-xl text-white font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && weatherData.length > 0 && (
          <div className="space-y-12">
            {/* Summer Alert */}
            {summerDetections.some(d => d.isLaterSunset && d.isEarlierSunrise) && (
              <SummerAlert summerDays={summerDetections.map(d => ({
                ...d,
                date: new Date(d.date),
              }))} />
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TemperatureChart data={weatherData.map(w => ({
                date: new Date(w.date),
                tempMax: w.tempMax,
              }))} />
              <SunChart data={weatherData.map(w => ({
                date: new Date(w.date),
                sunrise: new Date(w.sunrise),
                sunset: new Date(w.sunset),
              }))} />
            </div>

            {/* Weather Cards Grid */}
            <div>
              <h2 className="text-white text-3xl font-bold mb-6">{"This Week's Weather"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {enrichedWeatherData.map((weather) => (
                  <WeatherCard
                    key={weather.id}
                    date={new Date(weather.date)}
                    tempMax={weather.tempMax}
                    tempMin={weather.tempMin}
                    sunrise={new Date(weather.sunrise)}
                    sunset={new Date(weather.sunset)}
                    description={weather.description}
                    isLaterSunset={weather.isLaterSunset}
                    isEarlierSunrise={weather.isEarlierSunrise}
                    sunsetDiffMinutes={weather.sunsetDiffMinutes}
                    sunriseDiffMinutes={weather.sunriseDiffMinutes}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm">
            Data from OpenWeatherMap • Updates every 5 hours
          </p>
        </div>
      </div>
    </main>
  );
}
