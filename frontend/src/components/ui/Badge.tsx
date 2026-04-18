import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'growth' | 'mixed' | 'fixed' | 'gray' | 'blue' | 'indigo' | 'violet';

const variantClasses: Record<BadgeVariant, string> = {
  growth: 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.1)]',
  mixed:  'bg-amber-500/12 text-amber-400 border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
  fixed:  'bg-red-500/12 text-red-400 border border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.1)]',
  gray:   'bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]',
  blue:   'bg-blue-500/12 text-blue-400 border border-blue-500/25',
  indigo: 'bg-indigo-500/12 text-indigo-400 border border-indigo-500/25',
  violet: 'bg-violet-500/12 text-violet-400 border border-violet-500/25',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export default function Badge({
  variant = 'gray',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
