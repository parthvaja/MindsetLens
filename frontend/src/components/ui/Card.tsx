import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean;
  glow?: 'indigo' | 'green' | 'amber' | 'red' | 'none';
  variant?: 'default' | 'elevated' | 'ghost';
}

export default function Card({
  children,
  padding = true,
  glow = 'none',
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const glowClass = {
    indigo: 'shadow-[0_0_40px_rgba(99,102,241,0.1)] border-indigo-500/20',
    green: 'shadow-[0_0_40px_rgba(16,185,129,0.1)] border-emerald-500/20',
    amber: 'shadow-[0_0_40px_rgba(245,158,11,0.1)] border-amber-500/20',
    red: 'shadow-[0_0_40px_rgba(239,68,68,0.1)] border-red-500/20',
    none: 'border-[var(--border)]',
  }[glow];

  const variantClass = {
    default: 'bg-[var(--surface)]',
    elevated: 'bg-[var(--surface-2)]',
    ghost: 'bg-transparent',
  }[variant];

  return (
    <div
      className={cn(
        'rounded-xl border',
        variantClass,
        glowClass,
        padding ? 'p-6' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
