'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getStudent } from '@/lib/api/students';
import { SurveyResult } from '@/types/survey.types';
import SurveyForm from '@/components/surveys/SurveyForm';
import ResultsDisplay from '@/components/surveys/ResultsDisplay';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<SurveyResult | null>(null);

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="h-8 w-64 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Student not found.</p>
        <Link href="/dashboard/students" className="text-blue-600 hover:underline mt-2 inline-block">
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
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" />
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
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to {student.full_name}
      </Link>
      <SurveyForm
        studentId={id}
        studentName={student.full_name}
        onComplete={setResult}
      />
    </div>
  );
}
