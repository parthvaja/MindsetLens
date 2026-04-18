'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getStudent } from '@/lib/api/students';
import { getNotes } from '@/lib/api/analytics';
import Card from '@/components/ui/Card';
import NoteForm from '@/components/notes/NoteForm';
import NotesList from '@/components/notes/NotesList';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function StudentNotesPage() {
  const { id } = useParams<{ id: string }>();

  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
  });

  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => getNotes(id),
    enabled: !!student,
  });

  if (studentLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Student not found.</p>
        <Link href="/dashboard/students" className="text-blue-600 text-sm mt-2 inline-block">
          Back to Students
        </Link>
      </div>
    );
  }

  const notes = notesData?.results ?? [];

  return (
    <div>
      <Link
        href={`/dashboard/students/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to {student.full_name}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
          {student.first_name[0]}{student.last_name[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Observations — {student.full_name}</h1>
          <p className="text-sm text-gray-500">
            {notes.length} observation{notes.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Add note form */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Add Observation
            </h2>
            <NoteForm studentId={id} />
          </Card>
        </div>

        {/* Notes list */}
        <div className="lg:col-span-3">
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Observation History
            </h2>
            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <NotesList notes={notes} studentId={id} />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
