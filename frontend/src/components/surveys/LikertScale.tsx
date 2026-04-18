'use client';

import { LIKERT_OPTIONS } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';

interface LikertScaleProps {
  questionId: string;
  value?: number;
  onChange: (value: number) => void;
}

export default function LikertScale({ questionId, value, onChange }: LikertScaleProps) {
  return (
    <div className="space-y-2.5">
      {LIKERT_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-150',
              selected
                ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-indigo-500/30 hover:bg-[var(--surface-3)]'
            )}
          >
            <span
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 transition-all',
                selected
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                  : 'border-[var(--surface-3)] text-[var(--text-muted)] bg-[var(--surface)]'
              )}
            >
              {option.value}
            </span>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                selected ? 'text-indigo-300' : 'text-[var(--text-secondary)]'
              )}
            >
              {option.label}
            </span>
            {selected && (
              <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
