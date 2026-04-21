'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getStudyPlans } from '@/lib/api/studyplans';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, ChevronRight, Plus } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils/formatters';

function SkeletonPlanRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-40 bg-zinc-800 rounded-md" />
        <div className="h-2.5 w-24 bg-zinc-800 rounded-md" />
      </div>
      <div className="h-3 w-16 bg-zinc-800 rounded-md" />
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center">
              <BookOpen size={11} className="text-zinc-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Study Plans</span>
          </div>
          <h1 className="text-[28px] font-heading font-semibold text-zinc-50 tracking-tight leading-none">
            Study Plans
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            AI-generated personalised session plans for your students
          </p>
        </div>
        <Link href="/dashboard/students">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold shadow-[0_2px_8px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98]">
            <Plus size={14} />
            New Plan
          </button>
        </Link>
      </div>

      {/* Content */}
      {isError ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-10 text-center text-rose-400 text-sm">
          Failed to load study plans. Please refresh.
        </div>
      ) : isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <SkeletonPlanRow key={i} />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-cyan-400" />
            </div>
            <p className="text-zinc-200 text-sm font-medium mb-1">No study plans yet</p>
            <p className="text-xs text-zinc-500 mb-5 max-w-xs mx-auto">
              Select 2+ students from the Students page and generate a personalised AI study plan.
            </p>
            <Link href="/dashboard/students">
              <button className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(6,182,212,0.3)]">
                Go to Students
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                href={`/dashboard/study-plans/${plan.id}`}
                className="group flex items-center justify-between bg-zinc-900 rounded-xl border border-zinc-800 ring-1 ring-transparent p-4 hover:ring-zinc-700 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <BookOpen size={16} className="text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-zinc-100 truncate">
                      {plan.topic}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Users size={10} />
                        {plan.student_count} student{plan.student_count !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock size={10} />
                        {plan.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-xs text-zinc-500 hidden sm:block">
                    {formatRelativeDate(plan.created_at)}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
