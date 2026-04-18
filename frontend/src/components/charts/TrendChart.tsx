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
import { TrendingUp } from 'lucide-react';

interface TrendChartProps {
  trends: MindsetTrend[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const color =
      score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
    return (
      <div className="bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-[#8b949e] mb-1">{label}</p>
        <p className="font-bold" style={{ color }}>
          {score.toFixed(1)}/100
        </p>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ trends }: TrendChartProps) {
  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-[var(--text-muted)] text-sm gap-2">
        <TrendingUp size={20} className="opacity-40" />
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
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#6e7681' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#6e7681' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={70}
          stroke="#10b981"
          strokeDasharray="4 4"
          strokeOpacity={0.4}
          label={{ value: 'Growth', fill: '#10b981', fontSize: 10, opacity: 0.7 }}
        />
        <ReferenceLine
          y={40}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          strokeOpacity={0.4}
          label={{ value: 'Mixed', fill: '#f59e0b', fontSize: 10, opacity: 0.7 }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="url(#scoreGrad)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#111318' }}
          activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#111318', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
