'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getStudent } from '@/lib/api/students';
import { SurveyResult } from '@/types/survey.types';
import SurveyForm from '@/components/surveys/SurveyForm';
import ResultsDisplay from '@/components/surveys/ResultsDisplay';
import { ArrowLeft } from 'lucide-react';

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<SurveyResult | null>(null);

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-7 w-48 bg-[var(--surface-2)] rounded animate-pulse" />
        <div className="h-96 bg-[var(--surface)] rounded-2xl animate-pulse border border-[var(--border)]" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <p>Student not found.</p>
        <Link
          href="/dashboard/students"
          className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block transition-colors"
        >
          Back to students
        </Link>
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <Link
          href={`/dashboard/students/${id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to {student.full_name}
        </Link>
        <ResultsDisplay result={result} studentId={id} studentName={student.full_name} />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/students/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6 transition-colors"
      >
        <ArrowLeft size={12} />
        Back to {student.full_name}
      </Link>
      <SurveyForm studentId={id} studentName={student.full_name} onComplete={setResult} />
    </div>
  );
}
