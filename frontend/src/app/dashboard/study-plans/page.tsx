'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getStudyPlans } from '@/lib/api/studyplans';
import Card from '@/components/ui/Card';
import { BookOpen, Clock, Users, ChevronRight, Plus } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils/formatters';

function SkeletonPlanRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-[var(--surface-3)] shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-[var(--surface-3)] rounded-md" />
        <div className="h-2.5 w-24 bg-[var(--surface-3)] rounded-md" />
      </div>
      <div className="h-3 w-16 bg-[var(--surface-3)] rounded-md" />
    </div>
  );
}

export default function StudyPlansPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['study-plans'],
    queryFn: getStudyPlans,
  });

  const plans = data?.results ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Study Plans</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            AI-generated personalised session plans for your students
          </p>
        </div>
        <Link href="/dashboard/students">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-[0_2px_8px_rgba(99,102,241,0.35)] transition-all">
            <Plus size={14} />
            New Plan
          </button>
        </Link>
      </div>

      {/* Content */}
      {isError ? (
        <Card>
          <div className="text-center py-10 text-red-400 text-sm">
            Failed to load study plans. Please refresh.
          </div>
        </Card>
      ) : isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <SkeletonPlanRow key={i} />)}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-indigo-400" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm font-medium mb-1">
              No study plans yet
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-5 max-w-xs mx-auto">
              Select 2+ students from the Students page and generate a personalised AI study plan.
            </p>
            <Link href="/dashboard/students">
              <button className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(99,102,241,0.35)]">
                Go to Students
              </button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/dashboard/study-plans/${plan.id}`}
              className="group flex items-center justify-between bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 hover:border-indigo-500/30 hover:bg-[var(--surface-2)] transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                    {plan.topic}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Users size={10} />
                      {plan.student_count} student{plan.student_count !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock size={10} />
                      {plan.duration_minutes} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0 ml-4">
                <span className="text-xs text-[var(--text-muted)] hidden sm:block">
                  {formatRelativeDate(plan.created_at)}
                </span>
                <ChevronRight
                  size={14}
                  className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
