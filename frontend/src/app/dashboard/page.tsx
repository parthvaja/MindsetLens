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
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </Card>
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
        { name: 'Growth', value: stats.growth_count,  color: '#10b981' },
        { name: 'Mixed',  value: stats.mixed_count,   color: '#f59e0b' },
        { name: 'Fixed',  value: stats.fixed_count,   color: '#ef4444' },
      ]
    : [];

  const barData = stats
    ? [
        { label: 'Growth', value: stats.growth_count, color: '#10b981' },
        { label: 'Mixed',  value: stats.mixed_count,  color: '#f59e0b' },
        { label: 'Fixed',  value: stats.fixed_count,  color: '#ef4444' },
        {
          label: 'Unassessed',
          value: stats.total_students - stats.assessed_students,
          color: '#d1d5db',
        },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {teacher?.first_name ?? 'Teacher'}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your class overview.</p>
      </div>

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Students"
              value={stats?.total_students ?? 0}
              sub={`${stats?.assessed_students ?? 0} assessed`}
              icon={UserGroupIcon}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              label="Average Score"
              value={
                stats?.average_score != null
                  ? stats.average_score.toFixed(1)
                  : '—'
              }
              sub="out of 100"
              icon={ClipboardDocumentCheckIcon}
              color="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              label="Growth Mindset"
              value={stats?.growth_count ?? 0}
              sub={
                stats && stats.assessed_students > 0
                  ? `${Math.round((stats.growth_count / stats.assessed_students) * 100)}% of assessed`
                  : 'no assessments yet'
              }
              icon={ArrowTrendingUpIcon}
              color="bg-purple-50 text-purple-600"
            />
            <StatCard
              label="Recent Assessments"
              value={stats?.recent_assessments ?? 0}
              sub="last 7 days"
              icon={SparklesIcon}
              color="bg-amber-50 text-amber-600"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Mindset Distribution
              </h2>
              {stats && stats.assessed_students > 0 ? (
                <DonutChart data={donutData} />
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No assessments yet. Run surveys to see distribution.
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-base font-semibold text-gray-800 mb-4">
                Students by Mindset
              </h2>
              <BarChart data={barData} height={200} unit=" students" />
            </Card>
          </div>

          {/* Quick actions */}
          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/dashboard/students/new"
                className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <span className="text-2xl">➕</span>
                <div>
                  <p className="font-medium text-gray-700 group-hover:text-blue-700">
                    Add a Student
                  </p>
                  <p className="text-xs text-gray-400">Create a new student profile</p>
                </div>
              </Link>
              <Link
                href="/dashboard/students"
                className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium text-gray-700 group-hover:text-blue-700">
                    View All Students
                  </p>
                  <p className="text-xs text-gray-400">
                    Manage profiles and run surveys
                  </p>
                </div>
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
