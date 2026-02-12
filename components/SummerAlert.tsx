'use client';

import { format } from 'date-fns';

interface SummerAlertProps {
  summerDays: Array<{
    date: Date;
    isLaterSunset: boolean;
    isEarlierSunrise: boolean;
    sunsetDiffMinutes?: number;
    sunriseDiffMinutes?: number;
  }>;
}

export default function SummerAlert({ summerDays }: SummerAlertProps) {
  const trueSummerDays = summerDays.filter(day => day.isLaterSunset && day.isEarlierSunrise);
  
  if (trueSummerDays.length === 0) {
    return null;
  }

  return (
    <div className="glass rounded-3xl p-8 border-2 border-white/40 pulse-glow">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🌅</div>
        <h2 className="text-white text-3xl font-bold mb-2">Summer Days Detected!</h2>
        <p className="text-white/90 text-lg">
          The days are getting longer! Here are the special days this week:
        </p>
      </div>

      <div className="space-y-4">
        {trueSummerDays.map((day, index) => (
          <div key={index} className="glass-hover rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-xl">
                  {format(new Date(day.date), 'EEEE, MMMM d')}
                </div>
                <div className="text-white/80 text-sm mt-1">
                  Sunset: +{day.sunsetDiffMinutes} min • Sunrise: -{day.sunriseDiffMinutes} min
                </div>
              </div>
              <div className="text-4xl">☀️</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-white/80 text-sm">
          These days have both later sunsets (by 30+ min) and earlier sunrises (by 30+ min) 
          compared to any previous day this month.
        </p>
      </div>
    </div>
  );
}
