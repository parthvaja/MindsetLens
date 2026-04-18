'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getStudent } from '@/lib/api/students';
import { getNotes } from '@/lib/api/analytics';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import NoteForm from '@/components/notes/NoteForm';
import NotesList from '@/components/notes/NotesList';
import { ArrowLeft, FileText } from 'lucide-react';

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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
          <Skeleton className="lg:col-span-3 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">Student not found.</p>
        <Link
          href="/dashboard/students"
          className="text-indigo-400 text-sm mt-2 inline-block hover:text-indigo-300 transition-colors"
        >
          Back to Students
        </Link>
      </div>
    );
  }

  const notes = notesData?.results ?? [];

  return (
    <div className="animate-fade-in">
      <Link
        href={`/dashboard/students/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6 transition-colors"
      >
        <ArrowLeft size={12} />
        Back to {student.full_name}
      </Link>

      <div className="flex items-center gap-4 mb-7">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center text-base font-bold text-indigo-300">
          {student.first_name[0]}
          {student.last_name[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Observations —{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {student.full_name}
            </span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {notes.length} observation{notes.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Add note form */}
        <div className="lg:col-span-2">
          <Card>
            <p className="section-label mb-4">Add Observation</p>
            <NoteForm studentId={id} />
          </Card>
        </div>

        {/* Notes list */}
        <div className="lg:col-span-3">
          <Card>
            <p className="section-label mb-4">Observation History</p>
            {notesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-[var(--surface-2)] rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center mb-3">
                  <FileText size={18} className="text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-muted)]">No observations yet</p>
                <p className="text-xs text-[var(--text-muted)]/60 mt-1">
                  Add one to help Claude generate better recommendations
                </p>
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
