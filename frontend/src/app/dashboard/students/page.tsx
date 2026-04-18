'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getStudents } from '@/lib/api/students';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { SkeletonStudentRow, SkeletonTable } from '@/components/ui/Skeleton';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { formatRelativeDate } from '@/lib/utils/formatters';
import { Student } from '@/types/student.types';

type FilterType = 'all' | 'growth' | 'mixed' | 'fixed' | 'unassessed';
type ViewMode = 'card' | 'table';

const FILTER_TABS: { key: FilterType; label: string; color: string }[] = [
  { key: 'all',        label: 'All',        color: 'bg-gray-100 text-gray-700' },
  { key: 'growth',     label: 'Growth',     color: 'bg-emerald-100 text-emerald-700' },
  { key: 'mixed',      label: 'Mixed',      color: 'bg-amber-100 text-amber-700' },
  { key: 'fixed',      label: 'Fixed',      color: 'bg-red-100 text-red-700' },
  { key: 'unassessed', label: 'Unassessed', color: 'bg-gray-100 text-gray-500' },
];

function filterStudents(students: Student[], filter: FilterType): Student[] {
  if (filter === 'all') return students;
  if (filter === 'unassessed') return students.filter((s) => !s.last_assessed);
  return students.filter((s) => s.latest_classification === filter);
}

export default function StudentsPage() {
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState<FilterType>('all');
  const [view, setView]         = useState<ViewMode>('card');
  const [ordering, setOrdering] = useState('last_name');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['students', search, ordering],
    queryFn: () => getStudents({ search, ordering }),
  });

  const allStudents  = data?.results ?? [];
  const shown        = filterStudents(allStudents, filter);
  const totalCount   = data?.count ?? 0;
  const filterCounts = {
    all:        allStudents.length,
    growth:     allStudents.filter((s) => s.latest_classification === 'growth').length,
    mixed:      allStudents.filter((s) => s.latest_classification === 'mixed').length,
    fixed:      allStudents.filter((s) => s.latest_classification === 'fixed').length,
    unassessed: allStudents.filter((s) => !s.last_assessed).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {shown.length} of {totalCount} student{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/students/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Search + controls */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="last_name">Sort: Name</option>
          <option value="-latest_mindset_score">Sort: Score ↓</option>
          <option value="latest_mindset_score">Sort: Score ↑</option>
          <option value="-last_assessed">Sort: Recent</option>
        </select>

        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setView('card')}
            className={`px-3 py-2.5 ${view === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            title="Card view"
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2.5 border-l border-gray-200 ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            title="Table view"
          >
            <TableCellsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === tab.key
                ? tab.color + ' ring-2 ring-offset-1 ring-current'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            <span className="font-semibold">{filterCounts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isError ? (
        <Card>
          <div className="text-center py-10 text-red-500 text-sm">
            Failed to load students. Please refresh the page.
          </div>
        </Card>
      ) : isLoading ? (
        view === 'card' ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <SkeletonStudentRow key={i} />)}
          </div>
        ) : (
          <SkeletonTable rows={5} />
        )
      ) : shown.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">
              {search
                ? 'No students match your search.'
                : filter !== 'all'
                ? `No ${filter} mindset students.`
                : 'No students yet.'}
            </p>
            {!search && filter === 'all' && (
              <Link href="/dashboard/students/new">
                <Button variant="secondary" className="mt-2">
                  Add your first student
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : view === 'card' ? (
        <div className="space-y-3">
          {shown.map((student) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600 text-sm">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{student.full_name}</p>
                    <p className="text-sm text-gray-400">
                      {student.grade_level ? `Grade ${student.grade_level}` : 'Grade not set'}
                      {student.age ? ` · Age ${student.age}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-400">
                      {student.last_assessed
                        ? `Assessed ${formatRelativeDate(student.last_assessed)}`
                        : 'Not yet assessed'}
                    </p>
                    <p className="text-xs text-gray-300">
                      {student.survey_count ?? 0} survey{(student.survey_count ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <MindsetBadge
                    classification={student.latest_classification}
                    score={student.latest_mindset_score !== null ? Number(student.latest_mindset_score) : null}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Grade</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Score</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Last Assessed</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mindset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shown.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/students/${student.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-600">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </div>
                      <span className="font-medium text-gray-900">{student.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {student.grade_level ? `Grade ${student.grade_level}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-700 hidden md:table-cell font-medium">
                    {student.latest_mindset_score !== null
                      ? Number(student.latest_mindset_score).toFixed(1)
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 hidden lg:table-cell">
                    {student.last_assessed
                      ? formatRelativeDate(student.last_assessed)
                      : 'Not assessed'}
                  </td>
                  <td className="px-6 py-4">
                    <MindsetBadge
                      classification={student.latest_classification}
                      score={student.latest_mindset_score !== null ? Number(student.latest_mindset_score) : null}
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
