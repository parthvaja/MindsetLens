import { TeachingRecommendation } from '@/types/api.types';
import { categoryIcon } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';

interface RecommendationCardProps {
  rec: TeachingRecommendation;
}

const categoryConfig: Record<
  string,
  { border: string; bg: string; badge: string; text: string }
> = {
  communication: {
    border: 'border-blue-500/20',
    bg: 'hover:bg-blue-500/5',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    text: 'text-blue-400',
  },
  feedback: {
    border: 'border-violet-500/20',
    bg: 'hover:bg-violet-500/5',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    text: 'text-violet-400',
  },
  challenge: {
    border: 'border-emerald-500/20',
    bg: 'hover:bg-emerald-500/5',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    text: 'text-emerald-400',
  },
  motivation: {
    border: 'border-amber-500/20',
    bg: 'hover:bg-amber-500/5',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    text: 'text-amber-400',
  },
  general: {
    border: 'border-[var(--border)]',
    bg: 'hover:bg-[var(--surface-2)]',
    badge: 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]',
    text: 'text-[var(--text-muted)]',
  },
};

export default function RecommendationCard({ rec }: RecommendationCardProps) {
  const confidencePct = Math.round(rec.confidence_score * 100);
  const cfg = categoryConfig[rec.category] ?? categoryConfig.general;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all',
        'bg-[var(--surface-2)]',
        cfg.border,
        cfg.bg
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5 shrink-0">{categoryIcon(rec.category)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border',
                cfg.badge
              )}
            >
              {rec.category}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] ml-auto">
              {confidencePct}% confidence
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {rec.recommendation_text}
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mt-3 h-0.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', cfg.text.replace('text', 'bg'))}
          style={{ width: `${confidencePct}%`, opacity: 0.6 }}
        />
      </div>
    </div>
  );
}
