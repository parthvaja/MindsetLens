'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getStudent } from '@/lib/api/students';
import { SurveyResult } from '@/types/survey.types';
import SurveyForm from '@/components/surveys/SurveyForm';
import ResultsDisplay from '@/components/surveys/ResultsDisplay';
import { ArrowLeft, X } from 'lucide-react';

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
        <div className="h-7 w-48 bg-zinc-800 rounded animate-pulse" />
        <div className="h-96 bg-zinc-900 rounded-2xl animate-pulse border border-zinc-800" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p>Student not found.</p>
        <Link
          href="/dashboard/students"
          className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block transition-colors"
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
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to {student.full_name}
        </Link>
        <ResultsDisplay result={result} studentId={id} studentName={student.full_name} />
      </div>
    );
  }

  // Full-screen takeover for the survey
  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 overflow-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href={`/dashboard/students/${id}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
        >
          <X size={12} />
          Exit survey
        </Link>
        <SurveyForm studentId={id} studentName={student.full_name} onComplete={setResult} />
      </div>
    </div>
  );
}
