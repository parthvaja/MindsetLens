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

const DEFAULT_COLOR = '#6366f1';

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#21262d] border border-[#30363d] rounded-lg px-3 py-2 shadow-xl text-xs">
        <p className="text-[#8b949e] mb-0.5">{label}</p>
        <p className="font-bold text-[#e2e8f0]">
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
        className="flex items-center justify-center text-[var(--text-muted)] text-sm"
        style={{ height }}
      >
        No data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6e7681' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#6e7681' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip unit={unit} />}
          cursor={{ fill: 'rgba(99,102,241,0.05)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? DEFAULT_COLOR} opacity={0.8} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
