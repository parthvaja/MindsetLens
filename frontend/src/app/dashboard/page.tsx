'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getDashboardStats } from '@/lib/api/analytics';
import { useAuthStore } from '@/lib/store/authStore';
import { SkeletonCard } from '@/components/ui/Skeleton';
import DonutChart from '@/components/charts/DonutChart';
import {
  Users,
  ClipboardList,
  TrendingUp,
  Zap,
  Plus,
  ArrowRight,
  Brain,
  ArrowUpRight,
  Activity,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Animated counter hook
function useCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    startTime.current = null;
    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setCount(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

interface StatCardProps {
  label: string;
  value: number;
  displayValue?: string;
  sub?: string;
  icon: React.ElementType;
  trend?: number;
  accentColor: string;
  delay?: number;
}

function StatCard({ label, value, displayValue, sub, icon: Icon, trend, accentColor, delay = 0 }: StatCardProps) {
  const animatedVal = useCounter(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative bg-zinc-900 rounded-xl border border-zinc-800 ring-1 ring-transparent p-5 overflow-hidden hover:ring-zinc-700 hover:border-zinc-700 transition-all duration-200"
    >
      {/* Gradient glow on hover */}
      <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl', accentColor)} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Icon size={14} className="text-zinc-400" />
          </div>
        </div>

        <p className="text-[28px] font-bold text-zinc-50 tabular-nums leading-none mb-1.5">
          {displayValue ?? animatedVal}
        </p>

        <div className="flex items-center gap-2">
          {sub && <p className="text-xs text-zinc-500">{sub}</p>}
          {trend !== undefined && trend > 0 && (
            <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400 font-medium">
              <ArrowUpRight size={12} />
              {trend}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function DashboardPage() {
  const teacher = useAuthStore((s) => s.teacher);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const donutData = stats
    ? [
        { name: 'Growth', value: stats.growth_count, color: '#10b981' },
        { name: 'Mixed', value: stats.mixed_count, color: '#f59e0b' },
        { name: 'Fixed', value: stats.fixed_count, color: '#f43f5e' },
      ]
    : [];

  const avgScore = stats?.average_score != null ? stats.average_score : 0;
  const avgScoreDisplay = stats?.average_score != null ? stats.average_score.toFixed(1) : '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-cyan-500/10 flex items-center justify-center">
              <Brain size={11} className="text-cyan-400" />
            </div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
              Overview
            </span>
          </div>
          <h1 className="text-[28px] font-heading font-semibold text-zinc-50 tracking-tight leading-none">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
              {teacher?.first_name ?? 'Teacher'}
            </span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            {format(new Date(), "EEEE, MMMM d")} · Your classroom at a glance
          </p>
        </div>

        <Link
          href="/dashboard/students/new"
          className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_16px_rgba(6,182,212,0.4)] active:scale-[0.98]"
        >
          <Plus size={15} />
          Add Student
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={stats?.total_students ?? 0}
              sub={`${stats?.assessed_students ?? 0} assessed`}
              icon={Users}
              accentColor="bg-gradient-to-br from-blue-500/5 to-transparent"
              delay={0}
            />
            <StatCard
              label="Average Score"
              value={avgScore}
              displayValue={avgScoreDisplay}
              sub="out of 100"
              icon={Activity}
              accentColor="bg-gradient-to-br from-emerald-500/5 to-transparent"
              delay={0.05}
            />
            <StatCard
              label="Growth Mindset"
              value={stats?.growth_count ?? 0}
              sub={
                stats && stats.assessed_students > 0
                  ? `${Math.round((stats.growth_count / stats.assessed_students) * 100)}% of assessed`
                  : 'no assessments yet'
              }
              icon={TrendingUp}
              accentColor="bg-gradient-to-br from-cyan-500/5 to-transparent"
              delay={0.1}
            />
            <StatCard
              label="Recent Assessments"
              value={stats?.recent_assessments ?? 0}
              sub="last 7 days"
              icon={Zap}
              accentColor="bg-gradient-to-br from-amber-500/5 to-transparent"
              delay={0.15}
            />
          </div>

          {/* Charts + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Activity feed */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="lg:col-span-3 bg-zinc-900 rounded-xl border border-zinc-800 ring-1 ring-transparent hover:ring-zinc-700 transition-all p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <BarChart2 size={15} className="text-zinc-500" />
                  Mindset Distribution
                </h2>
                {stats && stats.assessed_students > 0 && (
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                    {stats.assessed_students} assessed
                  </span>
                )}
              </div>

              {stats && stats.assessed_students > 0 ? (
                <div className="space-y-3">
                  {[
                    { label: 'Growth Mindset', count: stats.growth_count, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                    { label: 'Mixed Mindset', count: stats.mixed_count, color: 'bg-amber-500', textColor: 'text-amber-400' },
                    { label: 'Fixed Mindset', count: stats.fixed_count, color: 'bg-rose-500', textColor: 'text-rose-400' },
                    {
                      label: 'Unassessed',
                      count: stats.total_students - stats.assessed_students,
                      color: 'bg-zinc-700',
                      textColor: 'text-zinc-400',
                    },
                  ].map(({ label, count, color, textColor }) => {
                    const pct = stats.total_students > 0 ? (count / stats.total_students) * 100 : 0;
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-zinc-400">{label}</span>
                          <span className={cn('text-xs font-semibold tabular-nums', textColor)}>
                            {count} · {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
                            className={cn('h-full rounded-full', color)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3">
                    <ClipboardList size={20} className="text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-400 mb-1">No assessments yet</p>
                  <p className="text-xs text-zinc-600">Run surveys to see mindset distribution</p>
                </div>
              )}
            </motion.div>

            {/* Donut chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.25 }}
              className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 ring-1 ring-transparent hover:ring-zinc-700 transition-all p-5"
            >
              <h2 className="text-sm font-semibold text-zinc-100 mb-5">Mindset Breakdown</h2>
              {stats && stats.assessed_students > 0 ? (
                <DonutChart data={donutData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-xs text-zinc-600">No data yet</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: '/dashboard/students/new',
                  icon: Plus,
                  title: 'Add a Student',
                  desc: 'Create a new student profile',
                  color: 'group-hover:text-cyan-400',
                  bgColor: 'group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30',
                },
                {
                  href: '/dashboard/students',
                  icon: Users,
                  title: 'View All Students',
                  desc: 'Manage profiles and run surveys',
                  color: 'group-hover:text-emerald-400',
                  bgColor: 'group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30',
                },
              ].map(({ href, icon: Icon, title, desc, color, bgColor }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center transition-all', bgColor)}>
                      <Icon size={16} className={cn('text-zinc-500 transition-colors', color)} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{title}</p>
                      <p className="text-xs text-zinc-500">{desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
