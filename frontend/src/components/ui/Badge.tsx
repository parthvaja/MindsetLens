import { HTMLAttributes } from 'react';

type BadgeVariant = 'growth' | 'mixed' | 'fixed' | 'gray' | 'blue';

const variantClasses: Record<BadgeVariant, string> = {
  growth: 'bg-emerald-100 text-emerald-800',
  mixed: 'bg-amber-100 text-amber-800',
  fixed: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
  blue: 'bg-blue-100 text-blue-800',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export default function Badge({ variant = 'gray', children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
