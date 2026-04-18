import { cn } from '@/lib/utils';
import { MindsetClassification } from '@/types/student.types';

interface MindsetBadgeProps {
  classification: MindsetClassification | null;
  score?: number | null;
  size?: 'sm' | 'md';
}

const config = {
  growth: {
    label: 'Growth',
    classes:
      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.12)]',
    dot: 'bg-emerald-400',
  },
  mixed: {
    label: 'Mixed',
    classes:
      'bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.12)]',
    dot: 'bg-amber-400',
  },
  fixed: {
    label: 'Fixed',
    classes:
      'bg-red-500/10 text-red-400 border border-red-500/25 shadow-[0_0_10px_rgba(239,68,68,0.12)]',
    dot: 'bg-red-400',
  },
};

export default function MindsetBadge({
  classification,
  score,
  size = 'sm',
}: MindsetBadgeProps) {
  if (!classification) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]">
        Not assessed
      </span>
    );
  }

  const cfg = config[classification];
  const label = cfg.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        cfg.classes
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {label}
      {score !== undefined && score !== null ? ` · ${Number(score).toFixed(0)}` : ''}
    </span>
  );
}
