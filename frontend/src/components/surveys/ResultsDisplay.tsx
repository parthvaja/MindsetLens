'use client';

import { SurveyResult } from '@/types/survey.types';
import Card from '@/components/ui/Card';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Zap, CheckCircle } from 'lucide-react';

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
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${color}50)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>
          {score.toFixed(0)}
        </span>
        <span className="text-xs text-[var(--text-muted)]">/100</span>
      </div>
    </div>
  );
}

export default function ResultsDisplay({
  result,
  studentId,
  studentName,
}: ResultsDisplayProps) {
  const router = useRouter();

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <Card glow={
        result.classification === 'growth' ? 'green' :
        result.classification === 'mixed' ? 'amber' : 'red'
      }>
        {/* Success header */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <CheckCircle size={18} className="text-emerald-400" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Survey Complete
          </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] text-center mb-7">
          Growth mindset analysis for{' '}
          <span className="text-[var(--text-primary)] font-medium">{studentName}</span>
        </p>

        <ScoreRing score={result.growth_mindset_score} />

        <div className="flex justify-center mt-5 mb-7">
          <MindsetBadge
            classification={result.classification}
            score={result.growth_mindset_score}
            size="md"
          />
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--surface-2)] rounded-xl border border-[var(--border)] p-4 text-center">
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Likert Score
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
              {result.likert_component.toFixed(1)}
            </p>
          </div>
          <div className="bg-[var(--surface-2)] rounded-xl border border-[var(--border)] p-4 text-center">
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Text Adjustment
            </p>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{
                color: result.text_adjustment >= 0 ? '#10b981' : '#ef4444',
              }}
            >
              {result.text_adjustment >= 0 ? '+' : ''}
              {result.text_adjustment.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-[var(--text-muted)]">
          <Zap size={10} />
          Scored in {result.processing_time_ms}ms · AI recommendations generating
        </div>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => router.push(`/dashboard/students/${studentId}`)}
        >
          View Profile
        </Button>
        <Button
          className="flex-1"
          onClick={() => router.push('/dashboard/students')}
        >
          All Students
        </Button>
      </div>
    </div>
  );
}
