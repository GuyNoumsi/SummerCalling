'use client';

import { format } from 'date-fns';
import { formatTemp, formatTime } from '@/lib/utils';

interface WeatherCardProps {
  date: Date;
  tempMax: number;
  tempMin: number;
  sunrise: Date;
  sunset: Date;
  description: string;
  isLaterSunset?: boolean;
  isEarlierSunrise?: boolean;
  sunsetDiffMinutes?: number;
  sunriseDiffMinutes?: number;
}

export default function WeatherCard({
  date,
  tempMax,
  tempMin,
  sunrise,
  sunset,
  description,
  isLaterSunset,
  isEarlierSunrise,
  sunsetDiffMinutes,
  sunriseDiffMinutes,
}: WeatherCardProps) {
  const isSummerDay = isLaterSunset && isEarlierSunrise;
  
  return (
    <div className={`glass-hover rounded-3xl p-6 relative overflow-hidden ${isSummerDay ? 'pulse-glow' : ''}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Date */}
        <div className="text-white/80 text-sm font-medium mb-2">
          {format(new Date(date), 'EEEE')}
        </div>
        <div className="text-white text-2xl font-bold mb-4">
          {format(new Date(date), 'MMM d')}
        </div>

        {/* Temperature */}
        <div className="mb-6">
          <div className="text-white text-4xl font-bold">
            {formatTemp(tempMax)}
          </div>
          <div className="text-white/70 text-lg">
            Low: {formatTemp(tempMin)}
          </div>
        </div>

        {/* Weather description */}
        <div className="text-white/90 capitalize mb-4 text-sm">
          {description}
        </div>

        {/* Sunrise/Sunset */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="text-lg">🌅</span>
            <span>Sunrise: {formatTime(new Date(sunrise))}</span>
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="text-lg">🌇</span>
            <span>Sunset: {formatTime(new Date(sunset))}</span>
          </div>
        </div>

        {/* Summer indicators */}
        {(isLaterSunset || isEarlierSunrise) && (
          <div className="space-y-2">
            {isLaterSunset && (
              <div className="summer-badge flex items-center gap-2">
                <span>🌅</span>
                <span>Sunset +{sunsetDiffMinutes}min</span>
              </div>
            )}
            {isEarlierSunrise && (
              <div className="summer-badge flex items-center gap-2">
                <span>☀️</span>
                <span>Sunrise -{sunriseDiffMinutes}min</span>
              </div>
            )}
          </div>
        )}

        {/* Summer day celebration */}
        {isSummerDay && (
          <div className="mt-3 text-center">
            <div className="text-white font-bold text-sm animate-pulse">
              🎉 Summer Day! 🎉
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
