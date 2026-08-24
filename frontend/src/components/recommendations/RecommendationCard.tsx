import React from 'react';
import { TeachingRecommendation } from '@/types/api.types';
import { categoryIcon } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  rec: TeachingRecommendation;
}

const categoryConfig: Record<string, {
  dot: string; iconTint: string; badge: string; bar: string;
}> = {
  communication: {
    dot: 'bg-blue-400',
    iconTint: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    bar: 'bg-blue-500',
  },
  feedback: {
    dot: 'bg-teal-400',
    iconTint: 'text-teal-400',
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    bar: 'bg-teal-500',
  },
  challenge: {
    dot: 'bg-emerald-400',
    iconTint: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
  },
  motivation: {
    dot: 'bg-amber-400',
    iconTint: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
  },
  general: {
    dot: 'bg-zinc-500',
    iconTint: 'text-zinc-400',
    badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    bar: 'bg-zinc-500',
  },
};

function RecommendationCard({ rec }: RecommendationCardProps) {
  const confidencePct = Math.round(rec.confidence_score * 100);
  const cfg = categoryConfig[rec.category] ?? categoryConfig.general;

  return (
    <div className="rounded-xl border border-zinc-800 p-4 transition-all bg-zinc-800/30 hover:border-zinc-700">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
          <span className={cn('w-2 h-2 rounded-full', cfg.dot)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border',
              cfg.badge
            )}>
              {rec.category}
            </span>
            <span className="text-[10px] text-zinc-600 ml-auto tabular-nums">{confidencePct}%</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{rec.recommendation_text}</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mt-3 ml-5 h-0.5 bg-zinc-700/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all opacity-60', cfg.bar)}
          style={{ width: `${confidencePct}%` }}
        />
      </div>
    </div>
  );
}

export default React.memo(RecommendationCard);
