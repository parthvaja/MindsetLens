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
    classes: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    dot: 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.8)]',
  },
  mixed: {
    label: 'Mixed',
    classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    dot: 'bg-amber-400 shadow-[0_0_5px_rgba(245,158,11,0.8)]',
  },
  fixed: {
    label: 'Fixed',
    classes: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    dot: 'bg-rose-400 shadow-[0_0_5px_rgba(244,63,94,0.8)]',
  },
};

export default function MindsetBadge({
  classification,
  score,
  size = 'sm',
}: MindsetBadgeProps) {
  if (!classification) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">
        Not assessed
      </span>
    );
  }

  const cfg = config[classification];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        cfg.classes
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', cfg.dot)} />
      {cfg.label}
      {score !== undefined && score !== null ? ` · ${Number(score).toFixed(0)}` : ''}
    </span>
  );
}
