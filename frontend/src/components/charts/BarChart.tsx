'use client';

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  unit?: string;
}

const DEFAULT_COLOR = '#06b6d4'; // cyan-500

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-zinc-500 mb-0.5">{label}</p>
        <p className="font-bold text-zinc-100">
          {payload[0].value}
          {unit}
        </p>
      </div>
    );
  }
  return null;
};

export default function BarChart({ data, height = 200, unit = '' }: BarChartProps) {
  if (data.every((d) => d.value === 0)) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500 text-sm"
        style={{ height }}
      >
        No data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#71717a' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ fill: 'rgba(6,182,212,0.05)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? DEFAULT_COLOR} opacity={0.85} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
