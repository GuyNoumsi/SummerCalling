'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface TemperatureChartProps {
  data: Array<{
    date: Date;
    tempMax: number;
  }>;
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
  const chartData = data.map(item => {
    const utcDate = new Date(item.date);
    const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
    
    return {
      date: format(localDate, 'EEE'),
      temp: Math.round(item.tempMax),
    };
  });

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-white text-2xl font-bold mb-6">Temperature Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#feca57" stopOpacity={0.8} />
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
            label={{ value: '°C', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
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
          />
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke="#feca57" 
            strokeWidth={3}
            dot={{ fill: '#fff', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7 }}
            fill="url(#tempGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
