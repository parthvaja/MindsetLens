'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SurveyResult } from '@/types/survey.types';
import MindsetBadge from '@/components/students/MindsetBadge';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Zap, CheckCircle, ArrowRight } from 'lucide-react';

interface ResultsDisplayProps {
  result: SurveyResult;
  studentId: string;
  studentName: string;
}

function AnimatedScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const raf = useRef<number>(0);
  const start = useRef<number | null>(null);

  useEffect(() => {
    start.current = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start.current) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [score]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={displayScore}
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {displayScore}
        </motion.span>
        <span className="text-xs text-zinc-500">/100</span>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ result, studentId, studentName }: ResultsDisplayProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="max-w-md mx-auto space-y-4"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 text-center shadow-2xl">
        {/* Success */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">Survey Complete</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-xs text-zinc-500 mb-7"
        >
          Mindset analysis for <span className="text-zinc-300 font-medium">{studentName}</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>
          <AnimatedScoreRing score={result.growth_mindset_score} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-5 mb-6"
        >
          <MindsetBadge classification={result.classification} score={result.growth_mindset_score} size="md" />
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          <div className="bg-zinc-800/60 rounded-xl border border-zinc-800 p-4">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wide mb-1.5">Likert Score</p>
            <p className="text-2xl font-bold text-zinc-100 tabular-nums">{result.likert_component.toFixed(1)}</p>
          </div>
          <div className="bg-zinc-800/60 rounded-xl border border-zinc-800 p-4">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wide mb-1.5">Text Adjustment</p>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: result.text_adjustment >= 0 ? '#10b981' : '#f43f5e' }}
            >
              {result.text_adjustment >= 0 ? '+' : ''}{result.text_adjustment.toFixed(1)}
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[10px] text-zinc-600 flex items-center justify-center gap-1"
        >
          <Zap size={10} />
          Scored in {result.processing_time_ms}ms · AI recommendations generating
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex gap-3"
      >
        <Button variant="secondary" className="flex-1" onClick={() => router.push(`/dashboard/students/${studentId}`)}>
          View Profile
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => router.push('/dashboard/students')}>
          All Students <ArrowRight size={14} />
        </Button>
      </motion.div>
    </motion.div>
  );
}
