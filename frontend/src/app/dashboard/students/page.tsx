'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getStudents } from '@/lib/api/students';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatDate, formatRelativeDate } from '@/lib/utils/formatters';

export default function StudentsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students', search],
    queryFn: () => getStudents({ search }),
  });

  const students = data?.results ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-0.5">
            {data?.count ?? 0} student{data?.count !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/students/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-2">
              {search ? 'No students match your search.' : 'No students yet.'}
            </p>
            {!search && (
              <Link href="/dashboard/students/new">
                <Button variant="secondary" className="mt-2">
                  Add your first student
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                    {student.first_name?.[0] || ''}{student.last_name?.[0] || ''}
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
                    <p className="text-xs text-gray-300">{student.survey_count} survey{student.survey_count !== 1 ? 's' : ''}</p>
                  </div>
                  <MindsetBadge
                    classification={student.latest_classification}
                    score={student.latest_mindset_score}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
