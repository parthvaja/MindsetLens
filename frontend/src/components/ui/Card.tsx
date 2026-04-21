import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  glow?: 'cyan' | 'green' | 'amber' | 'rose' | 'indigo' | 'none';
  variant?: 'default' | 'elevated' | 'ghost';
  hover?: boolean;
}

export default function Card({
  children,
  padding = true,
  glow = 'none',
  variant = 'default',
  hover = false,
  className = '',
  ...props
}: CardProps) {
  const glowClass = {
    cyan:   'shadow-[0_0_32px_rgba(6,182,212,0.08)] border-cyan-500/20',
    green:  'shadow-[0_0_32px_rgba(16,185,129,0.08)] border-emerald-500/20',
    amber:  'shadow-[0_0_32px_rgba(245,158,11,0.08)] border-amber-500/20',
    rose:   'shadow-[0_0_32px_rgba(244,63,94,0.08)] border-rose-500/20',
    indigo: 'shadow-[0_0_32px_rgba(99,102,241,0.08)] border-indigo-500/20',
    none:   'border-zinc-800',
  }[glow];

  const variantClass = {
    default:  'bg-zinc-900',
    elevated: 'bg-zinc-800',
    ghost:    'bg-transparent',
  }[variant];

  return (
    <div
      className={cn(
        'rounded-xl border ring-1 ring-transparent transition-all duration-200',
        variantClass,
        glowClass,
        hover && 'hover:ring-zinc-700 hover:scale-[1.005] cursor-pointer',
        padding ? 'p-5' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Named shadcn-style exports for composability
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold leading-none tracking-tight text-zinc-50', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-zinc-400', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center pt-4', className)} {...props} />;
}
