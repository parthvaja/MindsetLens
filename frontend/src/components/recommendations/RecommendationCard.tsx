import { TeachingRecommendation } from '@/types/api.types';
import { categoryIcon } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  rec: TeachingRecommendation;
}

const categoryConfig: Record<string, {
  border: string; bgHover: string; badge: string; bar: string;
}> = {
  communication: {
    border: 'border-l-blue-500/60',
    bgHover: 'hover:bg-blue-500/5',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    bar: 'bg-blue-500',
  },
  feedback: {
    border: 'border-l-violet-500/60',
    bgHover: 'hover:bg-violet-500/5',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    bar: 'bg-violet-500',
  },
  challenge: {
    border: 'border-l-emerald-500/60',
    bgHover: 'hover:bg-emerald-500/5',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    bar: 'bg-emerald-500',
  },
  motivation: {
    border: 'border-l-amber-500/60',
    bgHover: 'hover:bg-amber-500/5',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
  },
  general: {
    border: 'border-l-zinc-600/60',
    bgHover: 'hover:bg-zinc-800/40',
    badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    bar: 'bg-zinc-500',
  },
};

export default function RecommendationCard({ rec }: RecommendationCardProps) {
  const confidencePct = Math.round(rec.confidence_score * 100);
  const cfg = categoryConfig[rec.category] ?? categoryConfig.general;

  return (
    <div className={cn(
      'rounded-xl border border-zinc-800 border-l-2 p-4 transition-all bg-zinc-800/30',
      cfg.border,
      cfg.bgHover
    )}>
      <div className="flex items-start gap-3">
        <span className="text-base mt-0.5 shrink-0">{categoryIcon(rec.category)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border',
              cfg.badge
            )}>
              {rec.category}
            </span>
            <span className="text-[10px] text-zinc-600 ml-auto">{confidencePct}%</span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">{rec.recommendation_text}</p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mt-3 h-0.5 bg-zinc-700/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all opacity-60', cfg.bar)}
          style={{ width: `${confidencePct}%` }}
        />
      </div>
    </div>
  );
}
