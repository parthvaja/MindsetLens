'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudents } from '@/lib/api/students';
import { generateStudyPlan } from '@/lib/api/studyplans';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import { SkeletonStudentRow, SkeletonTable } from '@/components/ui/Skeleton';
import {
  Search, Plus, LayoutGrid, Table2, ChevronRight,
  BookOpen, X, Loader2, Users, SlidersHorizontal,
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils/formatters';
import { Student } from '@/types/student.types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'growth' | 'mixed' | 'fixed' | 'unassessed';
type ViewMode = 'card' | 'table';

const FILTER_TABS: { key: FilterType; label: string; dot?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'growth', label: 'Growth', dot: 'bg-emerald-400' },
  { key: 'mixed', label: 'Mixed', dot: 'bg-amber-400' },
  { key: 'fixed', label: 'Fixed', dot: 'bg-rose-400' },
  { key: 'unassessed', label: 'Unassessed' },
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

const STUDENT_COLOR_CLASSES = [
  { bg: 'from-cyan-500/20 to-sky-500/20', border: 'border-cyan-500/20', text: 'text-cyan-300' },
  { bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20', text: 'text-emerald-300' },
  { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20', text: 'text-amber-300' },
  { bg: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/20', text: 'text-violet-300' },
  { bg: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/20', text: 'text-rose-300' },
];

function StudentAvatar({ student, index = 0, size = 10 }: { student: Student; index?: number; size?: number }) {
  const colors = STUDENT_COLOR_CLASSES[index % STUDENT_COLOR_CLASSES.length];
  return (
    <div
      className={cn(
        `w-${size} h-${size} rounded-xl bg-gradient-to-br border flex items-center justify-center font-semibold text-sm shrink-0`,
        colors.bg, colors.border, colors.text
      )}
    >
      {student.first_name?.[0]}{student.last_name?.[0]}
    </div>
  );
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

  useEffect(() => { topicRef.current?.focus(); }, []);

  const mutation = useMutation({
    mutationFn: () =>
      generateStudyPlan({
        student_ids: selectedStudents.map((s) => s.id),
        topic,
        duration_minutes: duration,
        context_notes: contextNotes,
      }),
    onSuccess: (plan) => { toast.success('Study plan generated!'); onSuccess(plan.id); },
    onError: () => toast.error('Failed to generate study plan.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) { toast.error('Please enter a topic.'); return; }
    mutation.mutate();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !mutation.isPending) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
              <BookOpen size={14} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-50">Create Study Plan</h2>
              <p className="text-[11px] text-zinc-500">AI-personalised for {selectedStudents.length} students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-zinc-800">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Selected Students</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedStudents.map((s, i) => {
              const c = STUDENT_COLOR_CLASSES[i % STUDENT_COLOR_CLASSES.length];
              return (
                <span
                  key={s.id}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-gradient-to-r',
                    c.bg, c.text, c.border
                  )}
                >
                  {s.full_name}
                </span>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Topic <span className="text-rose-400">*</span>
            </label>
            <input
              ref={topicRef}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Fractions, Quadratic Equations…"
              disabled={mutation.isPending}
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Session Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={mutation.isPending}
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all disabled:opacity-50"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Additional Context <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Goals, prior knowledge gaps, classroom context…"
              rows={3}
              disabled={mutation.isPending}
              className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all resize-none disabled:opacity-50"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-400 hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!topic.trim() || mutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {mutation.isPending ? (
                <><Loader2 size={13} className="animate-spin" />Generating…</>
              ) : (
                <><BookOpen size={13} />Generate Plan</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

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
              <Users size={11} className="text-zinc-400" />
            </div>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Students</span>
          </div>
          <h1 className="text-[28px] font-heading font-semibold text-zinc-50 tracking-tight leading-none">
            Students
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {shown.length} of {totalCount} student{totalCount !== 1 ? 's' : ''}
            {selectedIds.size > 0 && (
              <span className="ml-2 text-cyan-400 font-medium">· {selectedIds.size} selected</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={clearSelection}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-zinc-700 transition-all"
            >
              <X size={12} />Clear
            </button>
          )}
          <Link href="/dashboard/students/new">
            <Button variant="primary" size="md">
              <Plus size={14} />Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + controls */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-9 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
          />
        </div>

        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
        >
          <option value="last_name">Name A→Z</option>
          <option value="-latest_mindset_score">Score ↓</option>
          <option value="latest_mindset_score">Score ↑</option>
          <option value="-last_assessed">Recent first</option>
        </select>

        <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setView('card')}
            className={cn(
              'w-9 h-9 flex items-center justify-center transition-all',
              view === 'card' ? 'bg-zinc-700 text-zinc-50' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            )}
            title="Card view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => setView('table')}
            className={cn(
              'w-9 h-9 flex items-center justify-center border-l border-zinc-800 transition-all',
              view === 'table' ? 'bg-zinc-700 text-zinc-50' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            )}
            title="Table view"
          >
            <Table2 size={14} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border transition-all',
                active
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                  : 'bg-transparent text-zinc-500 border-zinc-800 hover:bg-zinc-800/50 hover:text-zinc-300'
              )}
            >
              {tab.dot && (
                <span className={cn('w-1.5 h-1.5 rounded-full', tab.dot)} />
              )}
              {tab.label}
              <span className={cn(
                'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1',
                active ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800/80 text-zinc-500'
              )}>
                {filterCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Multi-select hint */}
      {!isLoading && shown.length > 1 && selectedIds.size === 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-xs text-cyan-400"
        >
          <SlidersHorizontal size={12} className="shrink-0" />
          Tip: check the boxes next to students to create a personalised multi-student study plan.
        </motion.div>
      )}

      {/* Content */}
      {isError ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-rose-400 text-sm">Failed to load students. Please refresh the page.</p>
        </div>
      ) : isLoading ? (
        view === 'card' ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <SkeletonStudentRow key={i} />)}
          </div>
        ) : (
          <SkeletonTable rows={5} />
        )
      ) : shown.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
            <Users size={20} className="text-zinc-600" />
          </div>
          <p className="text-zinc-300 text-sm font-medium mb-1">
            {search ? 'No students match your search.' : filter !== 'all' ? `No ${filter} mindset students.` : 'No students yet.'}
          </p>
          <p className="text-zinc-600 text-xs mb-4">
            {!search && filter === 'all' ? 'Get started by adding your first student.' : ''}
          </p>
          {!search && filter === 'all' && (
            <Link href="/dashboard/students/new">
              <Button variant="primary" size="sm">
                <Plus size={13} />Add your first student
              </Button>
            </Link>
          )}
        </div>
      ) : view === 'card' ? (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {shown.map((student, idx) => {
            const isSelected = selectedIds.has(student.id);
            return (
              <motion.div
                key={student.id}
                variants={rowVariants}
                className={cn(
                  'group flex items-center bg-zinc-900 rounded-xl border transition-all duration-150',
                  isSelected
                    ? 'border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_0_1px_rgba(6,182,212,0.1)]'
                    : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => toggleSelect(student.id, e)}
                  className={cn(
                    'flex-shrink-0 w-10 h-full flex items-center justify-center transition-all',
                    isSelected ? 'text-cyan-400' : 'text-zinc-600 opacity-0 group-hover:opacity-100'
                  )}
                  aria-label={isSelected ? `Deselect ${student.full_name}` : `Select ${student.full_name}`}
                >
                  <div className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                    isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-700'
                  )}>
                    {isSelected && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>

                <Link
                  href={`/dashboard/students/${student.id}`}
                  className="flex flex-1 items-center justify-between p-3.5 pl-2 min-w-0"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <StudentAvatar student={student} index={idx} size={10} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-zinc-100 truncate">{student.full_name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not set'}
                        {student.age ? ` · Age ${student.age}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-zinc-500">
                        {student.last_assessed ? `Assessed ${formatRelativeDate(student.last_assessed)}` : 'Not yet assessed'}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {student.survey_count ?? 0} survey{(student.survey_count ?? 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <MindsetBadge
                      classification={student.latest_classification}
                      score={student.latest_mindset_score !== null ? Number(student.latest_mindset_score) : null}
                    />
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Table view */
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="w-10 px-4 py-3" />
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Grade</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden md:table-cell">Score</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider hidden lg:table-cell">Last Assessed</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Mindset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {shown.map((student, idx) => {
                const isSelected = selectedIds.has(student.id);
                return (
                  <tr
                    key={student.id}
                    className={cn(
                      'transition-colors group cursor-pointer',
                      isSelected ? 'bg-cyan-500/5' : 'hover:bg-zinc-800/50'
                    )}
                    onClick={() => !isSelected && (window.location.href = `/dashboard/students/${student.id}`)}
                  >
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => toggleSelect(student.id, e)}
                        className="flex items-center justify-center"
                        aria-label={isSelected ? `Deselect ${student.full_name}` : `Select ${student.full_name}`}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                          isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-700 opacity-0 group-hover:opacity-100'
                        )}>
                          {isSelected && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <StudentAvatar student={student} index={idx} size={8} />
                        <span className="font-medium text-zinc-200">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">{student.grade_level ? `Grade ${student.grade_level}` : '—'}</td>
                    <td className="px-5 py-3.5 text-zinc-300 hidden md:table-cell font-semibold tabular-nums">
                      {student.latest_mindset_score !== null ? Number(student.latest_mindset_score).toFixed(1) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs hidden lg:table-cell">
                      {student.last_assessed ? formatRelativeDate(student.last_assessed) : 'Not assessed'}
                    </td>
                    <td className="px-5 py-3.5">
                      <MindsetBadge
                        classification={student.latest_classification}
                        score={student.latest_mindset_score !== null ? Number(student.latest_mindset_score) : null}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.size >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.55)] transition-all border border-cyan-400/30 active:scale-[0.98]"
            >
              <BookOpen size={16} />
              Create Study Plan
              <span className="ml-1 w-5 h-5 rounded-full bg-zinc-950/20 flex items-center justify-center text-xs font-bold">
                {selectedIds.size}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <StudyPlanModal
            selectedStudents={selectedStudents}
            onClose={() => setShowModal(false)}
            onSuccess={handlePlanSuccess}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
