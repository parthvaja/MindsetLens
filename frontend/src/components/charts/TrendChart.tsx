'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
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
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-zinc-500 mb-1">{label}</p>
        <p className="font-bold" style={{ color }}>{score.toFixed(1)}/100</p>
      </div>
    );
  }
  return null;
};

export default function TrendChart({ trends }: TrendChartProps) {
  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-zinc-600 text-sm gap-2">
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
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#52525b' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#52525b' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1 }} />
        <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.35}
          label={{ value: 'Growth', fill: '#10b981', fontSize: 10, opacity: 0.6 }} />
        <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.35}
          label={{ value: 'Mixed', fill: '#f59e0b', fontSize: 10, opacity: 0.6 }} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="url(#cyanGrad)"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={{ r: 3.5, fill: '#06b6d4', strokeWidth: 2, stroke: '#09090b' }}
          activeDot={{ r: 5.5, fill: '#22d3ee', stroke: '#09090b', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
