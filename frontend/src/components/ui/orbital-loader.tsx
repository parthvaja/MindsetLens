'use client';

import React from 'react';
import { cva } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const orbitalLoaderVariants = cva('flex gap-3 items-center justify-center', {
  variants: {
    messagePlacement: {
      bottom: 'flex-col',
      top: 'flex-col-reverse',
      right: 'flex-row',
      left: 'flex-row-reverse',
    },
  },
  defaultVariants: {
    messagePlacement: 'bottom',
  },
});

export interface OrbitalLoaderProps {
  message?: string;
  messagePlacement?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

export function OrbitalLoader({
  className,
  message,
  messagePlacement,
  size = 'md',
  ...props
}: React.ComponentProps<'div'> & OrbitalLoaderProps) {
  return (
    <div className={cn(orbitalLoaderVariants({ messagePlacement }))}>
      <div className={cn('relative', sizeMap[size], className)} {...props}>
        <motion.div
          className="absolute inset-0 border-[1.5px] border-transparent border-t-indigo-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[4px] border-[1.5px] border-transparent border-t-violet-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[8px] border-[1.5px] border-transparent border-t-indigo-300/60 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
        </div>
      </div>
      {message && (
        <div className="text-sm text-[var(--text-secondary)] font-medium">{message}</div>
      )}
    </div>
  );
}
