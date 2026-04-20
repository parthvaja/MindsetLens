'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudents } from '@/lib/api/students';
import { generateStudyPlan } from '@/lib/api/studyplans';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SkeletonStudentRow, SkeletonTable } from '@/components/ui/Skeleton';
import {
  Search, Plus, LayoutGrid, Table2, ChevronRight,
  BookOpen, X, Loader2, CheckSquare,
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils/formatters';
import { Student } from '@/types/student.types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'growth' | 'mixed' | 'fixed' | 'unassessed';
type ViewMode = 'card' | 'table';

const FILTER_TABS: {
  key: FilterType;
  label: string;
  activeClass: string;
}[] = [
  { key: 'all', label: 'All', activeClass: 'bg-[var(--surface-2)] text-[var(--text-primary)] border-[var(--surface-3)]' },
  { key: 'growth', label: 'Growth', activeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
  { key: 'mixed', label: 'Mixed', activeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25' },
  { key: 'fixed', label: 'Fixed', activeClass: 'bg-red-500/10 text-red-400 border-red-500/25' },
  { key: 'unassessed', label: 'Unassessed', activeClass: 'bg-[var(--surface-2)] text-[var(--text-secondary)] border-[var(--surface-3)]' },
];

const DURATION_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes', value: 60 },
  { label: '90 minutes', value: 90 },
];

function filterStudents(students: Student[], filter: FilterType): Student[] {
  if (filter === 'all') return students;
  if (filter === 'unassessed') return students.filter((s) => !s.last_assessed);
  return students.filter((s) => s.latest_classification === filter);
}

// ── Study Plan Modal ──────────────────────────────────────────────────────────

interface StudyPlanModalProps {
  selectedStudents: Student[];
  onClose: () => void;
  onSuccess: (planId: string) => void;
}

function StudyPlanModal({ selectedStudents, onClose, onSuccess }: StudyPlanModalProps) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(60);
  const [contextNotes, setContextNotes] = useState('');
  const topicRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    topicRef.current?.focus();
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      generateStudyPlan({
        student_ids: selectedStudents.map((s) => s.id),
        topic,
        duration_minutes: duration,
        context_notes: contextNotes,
      }),
    onSuccess: (plan) => {
      toast.success('Study plan generated!');
      onSuccess(plan.id);
    },
    onError: () => {
      toast.error('Failed to generate study plan. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !mutation.isPending) onClose(); }}
    >
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/25 flex items-center justify-center">
              <BookOpen size={14} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Create Study Plan</h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                AI-personalised for {selectedStudents.length} students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)] transition-all disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </div>

        {/* Selected students */}
        <div className="px-6 py-3 border-b border-[var(--border)]">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
            Selected Students
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedStudents.map((s, i) => {
              const colors = STUDENT_COLOR_CLASSES[i % STUDENT_COLOR_CLASSES.length];
              return (
                <span
                  key={s.id}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
                    colors.bg, colors.text, colors.border,
                  )}
                >
                  {s.full_name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Topic <span className="text-red-400">*</span>
            </label>
            <input
              ref={topicRef}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Fractions, Quadratic Equations…"
              disabled={mutation.isPending}
              className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Session Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={mutation.isPending}
              className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all disabled:opacity-50"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
              Additional Context <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <textarea
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Any specific goals, prior knowledge gaps, or classroom context…"
              rows={3}
              disabled={mutation.isPending}
              className="w-full px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!topic.trim() || mutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <BookOpen size={13} />
                  Generate Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Student colour palette (cycles if more than 5 selected)
const STUDENT_COLOR_CLASSES = [
  { bg: 'bg-indigo-500/15',  text: 'text-indigo-300',  border: 'border-indigo-500/25'  },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/25' },
  { bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/25'   },
  { bg: 'bg-violet-500/15',  text: 'text-violet-300',  border: 'border-violet-500/25'  },
  { bg: 'bg-rose-500/15',    text: 'text-rose-300',    border: 'border-rose-500/25'    },
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewMode>('card');
  const [ordering, setOrdering] = useState('last_name');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['students', search, ordering],
    queryFn: () => getStudents({ search, ordering }),
  });

  const allStudents = data?.results ?? [];
  const shown = filterStudents(allStudents, filter);
  const totalCount = data?.count ?? 0;
  const filterCounts = {
    all: allStudents.length,
    growth: allStudents.filter((s) => s.latest_classification === 'growth').length,
    mixed: allStudents.filter((s) => s.latest_classification === 'mixed').length,
    fixed: allStudents.filter((s) => s.latest_classification === 'fixed').length,
    unassessed: allStudents.filter((s) => !s.last_assessed).length,
  };

  const selectedStudents = allStudents.filter((s) => selectedIds.has(s.id));

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handlePlanSuccess = (planId: string) => {
    setShowModal(false);
    clearSelection();
    router.push(`/dashboard/study-plans/${planId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Students</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {shown.length} of {totalCount} student{totalCount !== 1 ? 's' : ''}
            {selectedIds.size > 0 && (
              <span className="ml-2 text-indigo-400 font-medium">
                · {selectedIds.size} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)] border border-[var(--border)] transition-all"
            >
              <X size={12} />
              Clear
            </button>
          )}
          <Link href="/dashboard/students/new">
            <Button>
              <Plus size={14} className="mr-1.5" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + controls */}
      <div className="flex gap-2.5">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all"
          />
        </div>

        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/40 transition-all"
        >
          <option value="last_name">Sort: Name</option>
          <option value="-latest_mindset_score">Sort: Score ↓</option>
          <option value="latest_mindset_score">Sort: Score ↑</option>
          <option value="-last_assessed">Sort: Recent</option>
        </select>

        <div className="flex rounded-xl border border-[var(--border)] overflow-hidden">
          <button
            onClick={() => setView('card')}
            className={cn(
              'px-3 py-2.5 transition-all',
              view === 'card'
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
            )}
            title="Card view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView('table')}
            className={cn(
              'px-3 py-2.5 border-l border-[var(--border)] transition-all',
              view === 'table'
                ? 'bg-indigo-600 text-white'
                : 'bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
            )}
            title="Table view"
          >
            <Table2 size={14} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              filter === tab.key
                ? tab.activeClass
                : 'bg-transparent text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)]'
            )}
          >
            {tab.label}
            <span
              className={cn(
                'inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold',
                filter === tab.key ? 'bg-white/15' : 'bg-[var(--surface-2)]'
              )}
            >
              {filterCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Hint when no selection yet */}
      {!isLoading && shown.length > 1 && selectedIds.size === 0 && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-500/8 border border-indigo-500/15 text-xs text-indigo-300">
          <CheckSquare size={13} className="shrink-0" />
          Tip: check the boxes next to students to create a personalised multi-student study plan.
        </div>
      )}

      {/* Content */}
      {isError ? (
        <Card>
          <div className="text-center py-10 text-red-400 text-sm">
            Failed to load students. Please refresh the page.
          </div>
        </Card>
      ) : isLoading ? (
        view === 'card' ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStudentRow key={i} />
            ))}
          </div>
        ) : (
          <SkeletonTable rows={5} />
        )
      ) : shown.length === 0 ? (
        <Card>
          <div className="text-center py-14">
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3">
              <Search size={20} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-1">
              {search
                ? 'No students match your search.'
                : filter !== 'all'
                ? `No ${filter} mindset students.`
                : 'No students yet.'}
            </p>
            {!search && filter === 'all' && (
              <Link href="/dashboard/students/new">
                <Button variant="secondary" className="mt-3" size="sm">
                  Add your first student
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : view === 'card' ? (
        <div className="space-y-2.5">
          {shown.map((student) => {
            const isSelected = selectedIds.has(student.id);
            return (
              <div
                key={student.id}
                className={cn(
                  'group flex items-center justify-between bg-[var(--surface)] rounded-xl border transition-all',
                  isSelected
                    ? 'border-indigo-500/40 bg-indigo-500/5 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'
                    : 'border-[var(--border)] hover:border-indigo-500/30 hover:bg-[var(--surface-2)]'
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => toggleSelect(student.id, e)}
                  className={cn(
                    'flex-shrink-0 w-10 h-full flex items-center justify-center rounded-l-xl transition-all',
                    isSelected
                      ? 'text-indigo-400'
                      : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100'
                  )}
                  title={isSelected ? 'Deselect student' : 'Select student'}
                  aria-label={isSelected ? `Deselect ${student.full_name}` : `Select ${student.full_name}`}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-[var(--border)] bg-transparent'
                    )}
                  >
                    {isSelected && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Content — navigates to student detail */}
                <Link
                  href={`/dashboard/students/${student.id}`}
                  className="flex flex-1 items-center justify-between p-4 pl-2 min-w-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center font-semibold text-indigo-300 text-sm shrink-0">
                      {student.first_name?.[0]}
                      {student.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                        {student.full_name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not set'}
                        {student.age ? ` · Age ${student.age}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[var(--text-muted)]">
                        {student.last_assessed
                          ? `Assessed ${formatRelativeDate(student.last_assessed)}`
                          : 'Not yet assessed'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]/60 mt-0.5">
                        {student.survey_count ?? 0} survey
                        {(student.survey_count ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <MindsetBadge
                      classification={student.latest_classification}
                      score={
                        student.latest_mindset_score !== null
                          ? Number(student.latest_mindset_score)
                          : null
                      }
                    />
                    <ChevronRight
                      size={14}
                      className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors"
                    />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table view */
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="w-10 px-4 py-3" />
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Student
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                  Score
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
                  Last Assessed
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Mindset
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {shown.map((student) => {
                const isSelected = selectedIds.has(student.id);
                return (
                  <tr
                    key={student.id}
                    className={cn(
                      'transition-colors group',
                      isSelected
                        ? 'bg-indigo-500/8'
                        : 'hover:bg-[var(--surface-2)] cursor-pointer'
                    )}
                    onClick={() =>
                      !isSelected && (window.location.href = `/dashboard/students/${student.id}`)
                    }
                  >
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => toggleSelect(student.id, e)}
                        className="flex items-center justify-center"
                        aria-label={isSelected ? `Deselect ${student.full_name}` : `Select ${student.full_name}`}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-[var(--border)] bg-transparent opacity-0 group-hover:opacity-100'
                          )}
                        >
                          {isSelected && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/15 flex items-center justify-center text-xs font-semibold text-indigo-300">
                          {student.first_name?.[0]}
                          {student.last_name?.[0]}
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {student.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)] text-xs">
                      {student.grade_level ? `Grade ${student.grade_level}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-secondary)] hidden md:table-cell font-semibold tabular-nums">
                      {student.latest_mindset_score !== null
                        ? Number(student.latest_mindset_score).toFixed(1)
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)] text-xs hidden lg:table-cell">
                      {student.last_assessed
                        ? formatRelativeDate(student.last_assessed)
                        : 'Not assessed'}
                    </td>
                    <td className="px-5 py-3.5">
                      <MindsetBadge
                        classification={student.latest_classification}
                        score={
                          student.latest_mindset_score !== null
                            ? Number(student.latest_mindset_score)
                            : null
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Button — appears when 2+ selected */}
      {selectedIds.size >= 2 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-[0_8px_30px_rgba(99,102,241,0.5)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.65)] transition-all border border-indigo-400/30 backdrop-blur-sm"
          >
            <BookOpen size={16} />
            Create Study Plan
            <span className="ml-1 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
              {selectedIds.size}
            </span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <StudyPlanModal
          selectedStudents={selectedStudents}
          onClose={() => setShowModal(false)}
          onSuccess={handlePlanSuccess}
        />
      )}
    </div>
  );
}
