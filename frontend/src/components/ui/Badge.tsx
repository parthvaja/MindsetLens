import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        growth: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
        mixed:  'bg-amber-500/10 text-amber-400 border-amber-500/25',
        fixed:  'bg-rose-500/10 text-rose-400 border-rose-500/25',
        gray:   'bg-zinc-800 text-zinc-400 border-zinc-700',
        blue:   'bg-blue-500/10 text-blue-400 border-blue-500/25',
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
        violet: 'bg-violet-500/10 text-violet-400 border-violet-500/25',
        cyan:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
        default:'border-transparent bg-cyan-500 text-zinc-950',
        secondary:'border-zinc-700 bg-zinc-800 text-zinc-300',
        destructive:'bg-rose-500/10 text-rose-400 border-rose-500/25',
        outline:'border-zinc-700 text-zinc-300',
      },
    },
    defaultVariants: {
      variant: 'gray',
    },
  }
);

type BadgeVariant = 'growth' | 'mixed' | 'fixed' | 'gray' | 'blue' | 'indigo' | 'violet' | 'cyan' | 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
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
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

export { badgeVariants };
export type { BadgeVariant };
