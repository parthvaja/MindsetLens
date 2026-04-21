'use client';

import { LIKERT_OPTIONS } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LikertScaleProps {
  questionId: string;
  value?: number;
  onChange: (value: number) => void;
}

export default function LikertScale({ questionId, value, onChange }: LikertScaleProps) {
  return (
    <div className="space-y-2">
      {LIKERT_OPTIONS.map((option, idx) => {
        const selected = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
            onClick={() => onChange(option.value)}
            className={cn(
              'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-150 active:scale-[0.99]',
              selected
                ? 'border-cyan-500/50 bg-cyan-500/8 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
                : 'border-zinc-800 bg-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800'
            )}
          >
            <span
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition-all',
                selected
                  ? 'border-cyan-500 bg-cyan-500 text-zinc-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'border-zinc-700 text-zinc-500 bg-zinc-900'
              )}
            >
              {option.value}
            </span>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                selected ? 'text-cyan-300' : 'text-zinc-400'
              )}
            >
              {option.label}
            </span>
            {selected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
