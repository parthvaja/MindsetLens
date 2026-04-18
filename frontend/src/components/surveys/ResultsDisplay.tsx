'use client';

import { SurveyResult } from '@/types/survey.types';
import Card from '@/components/ui/Card';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface ResultsDisplayProps {
  result: SurveyResult;
  studentId: string;
  studentName: string;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{score.toFixed(0)}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ result, studentId, studentName }: ResultsDisplayProps) {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Survey Complete!</h2>
        <p className="text-gray-500 text-center mb-8">
          Growth mindset analysis for <strong>{studentName}</strong>
        </p>

        <ScoreRing score={result.growth_mindset_score} />

        <div className="text-center mt-6 mb-8">
          <MindsetBadge
            classification={result.classification}
            score={result.growth_mindset_score}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Likert Score</p>
            <p className="text-2xl font-bold text-gray-700">{result.likert_component.toFixed(1)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Text Adjustment</p>
            <p
              className={[
                'text-2xl font-bold',
                result.text_adjustment >= 0 ? 'text-emerald-600' : 'text-red-600',
              ].join(' ')}
            >
              {result.text_adjustment >= 0 ? '+' : ''}
              {result.text_adjustment.toFixed(1)}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Scored in {result.processing_time_ms}ms · AI recommendations generating in background
        </p>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => router.push(`/dashboard/students/${studentId}`)}
        >
          View Student Profile
        </Button>
        <Button
          className="flex-1"
          onClick={() => router.push('/dashboard/students')}
        >
          Back to Students
        </Button>
      </div>
    </div>
  );
}
