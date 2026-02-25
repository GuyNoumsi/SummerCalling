'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface SunChartProps {
  data: Array<{
    date: Date;
    sunrise: Date;
    sunset: Date;
  }>;
}

export default function SunChart({ data }: SunChartProps) {
  // Convert times to minutes since midnight for charting
  const getMinutesSinceMidnight = (date: Date) => {
    const d = new Date(date);
    return d.getHours() * 60 + d.getMinutes();
  };

  const formatMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const chartData = data.map(item => {
    const utcDate = new Date(item.date);
    const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
    
    return {
      date: format(localDate, 'EEE'),
      sunrise: getMinutesSinceMidnight(new Date(item.sunrise)),
      sunset: getMinutesSinceMidnight(new Date(item.sunset)),
    };
  });

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-white text-2xl font-bold mb-6">Sunrise & Sunset Times</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="sunriseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#feca57" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#feca57" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="sunsetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '14px', fontWeight: '500' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.7)"
            style={{ fontSize: '14px', fontWeight: '500' }}
            tickFormatter={formatMinutesToTime}
            domain={['dataMin - 30', 'dataMax + 30']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              color: '#fff',
            }}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            formatter={(value: any) => formatMinutesToTime(value)}
          />
          <Legend 
            wrapperStyle={{ color: '#fff', paddingTop: '20px' }}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="sunrise" 
            name="Sunrise"
            stroke="#feca57" 
            strokeWidth={3}
            dot={{ fill: '#feca57', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line 
            type="monotone" 
            dataKey="sunset" 
            name="Sunset"
            stroke="#ff6b6b" 
            strokeWidth={3}
            dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
