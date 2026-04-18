'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { MindsetTrend } from '@/types/api.types';
import { format, parseISO } from 'date-fns';

interface TrendChartProps {
  trends: MindsetTrend[];
}

export default function TrendChart({ trends }: TrendChartProps) {
  if (trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No trend data yet. Complete a survey to start tracking.
      </div>
    );
  }

  const data = trends.map((t) => ({
    date: format(parseISO(t.recorded_at), 'MMM d'),
    score: Number(t.score),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          formatter={(value: number) => [value.toFixed(1), 'Mindset Score']}
        />
        <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Growth', fill: '#10b981', fontSize: 11 }} />
        <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Mixed', fill: '#f59e0b', fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#3b82f6' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
