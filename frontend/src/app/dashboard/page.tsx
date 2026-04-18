'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/api/analytics';
import { useAuthStore } from '@/lib/store/authStore';
import Card from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import DonutChart from '@/components/charts/DonutChart';
import BarChart from '@/components/charts/BarChart';
import {
  Users,
  ClipboardList,
  TrendingUp,
  Zap,
  Plus,
  ArrowRight,
  Brain,
} from 'lucide-react';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <div className="relative bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 overflow-hidden group hover:border-[var(--surface-3)] transition-all duration-200">
      {/* Subtle gradient bg */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient} rounded-xl`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {label}
          </p>
          <span className={`p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]`}>
            <Icon size={14} className="text-[var(--text-secondary)]" />
          </span>
        </div>
        <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
        {sub && (
          <p className="text-xs text-[var(--text-muted)] mt-1.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const teacher = useAuthStore((s) => s.teacher);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const donutData = stats
    ? [
        { name: 'Growth', value: stats.growth_count, color: '#10b981' },
        { name: 'Mixed', value: stats.mixed_count, color: '#f59e0b' },
        { name: 'Fixed', value: stats.fixed_count, color: '#ef4444' },
      ]
    : [];

  const barData = stats
    ? [
        { label: 'Growth', value: stats.growth_count, color: '#10b981' },
        { label: 'Mixed', value: stats.mixed_count, color: '#f59e0b' },
        { label: 'Fixed', value: stats.fixed_count, color: '#ef4444' },
        {
          label: 'Unassessed',
          value: stats.total_students - stats.assessed_students,
          color: '#3d4e5f',
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={18} className="text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {teacher?.first_name ?? 'Teacher'}
            </span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here&apos;s your class overview.
          </p>
        </div>
        <Link
          href="/dashboard/students/new"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 border border-indigo-500/40"
        >
          <Plus size={14} />
          Add Student
        </Link>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={stats?.total_students ?? 0}
              sub={`${stats?.assessed_students ?? 0} assessed`}
              icon={Users}
              gradient="bg-gradient-to-br from-blue-500/5 to-transparent"
            />
            <StatCard
              label="Average Score"
              value={
                stats?.average_score != null
                  ? stats.average_score.toFixed(1)
                  : '—'
              }
              sub="out of 100"
              icon={ClipboardList}
              gradient="bg-gradient-to-br from-emerald-500/5 to-transparent"
            />
            <StatCard
              label="Growth Mindset"
              value={stats?.growth_count ?? 0}
              sub={
                stats && stats.assessed_students > 0
                  ? `${Math.round(
                      (stats.growth_count / stats.assessed_students) * 100
                    )}% of assessed`
                  : 'no assessments yet'
              }
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-violet-500/5 to-transparent"
            />
            <StatCard
              label="Recent Assessments"
              value={stats?.recent_assessments ?? 0}
              sub="last 7 days"
              icon={Zap}
              gradient="bg-gradient-to-br from-amber-500/5 to-transparent"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Mindset Distribution
                </h2>
                {stats && stats.assessed_students > 0 && (
                  <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                    {stats.assessed_students} assessed
                  </span>
                )}
              </div>
              {stats && stats.assessed_students > 0 ? (
                <DonutChart data={donutData} />
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mb-3">
                    <ClipboardList size={20} className="text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-1">No assessments yet</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Run surveys to see distribution
                  </p>
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Students by Mindset
                </h2>
              </div>
              <BarChart data={barData} height={200} unit=" students" />
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/dashboard/students/new"
                className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                    <Plus size={16} className="text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Add a Student
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Create a new student profile
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
              </Link>

              <Link
                href="/dashboard/students"
                className="group flex items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
                    <Users size={16} className="text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      View All Students
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Manage profiles and run surveys
                    </p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
