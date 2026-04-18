'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getStudents } from '@/lib/api/students';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SkeletonStudentRow, SkeletonTable } from '@/components/ui/Skeleton';
import { Search, Plus, LayoutGrid, Table2, ChevronRight } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils/formatters';
import { Student } from '@/types/student.types';
import { cn } from '@/lib/utils';

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

function filterStudents(students: Student[], filter: FilterType): Student[] {
  if (filter === 'all') return students;
  if (filter === 'unassessed') return students.filter((s) => !s.last_assessed);
  return students.filter((s) => s.latest_classification === filter);
}

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewMode>('card');
  const [ordering, setOrdering] = useState('last_name');

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Students</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {shown.length} of {totalCount} student{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/students/new">
          <Button>
            <Plus size={14} className="mr-1.5" />
            Add Student
          </Button>
        </Link>
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
          {shown.map((student) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="group flex items-center justify-between bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 hover:border-indigo-500/30 hover:bg-[var(--surface-2)] transition-all"
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
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
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
              {shown.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-[var(--surface-2)] transition-colors cursor-pointer group"
                  onClick={() =>
                    (window.location.href = `/dashboard/students/${student.id}`)
                  }
                >
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
