'use client';

import { motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  step?: number;
  totalSteps?: number;
  onContinue?: () => void;
  onBack?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const ProgressIndicator = ({
  step = 1,
  totalSteps = 3,
  onContinue,
  onBack,
  disabled = false,
  loading = false,
}: ProgressIndicatorProps) => {
  const isFirst = step === 1;
  const isLast = step === totalSteps;
  const dotSpacing = 32;

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      {/* Step dots */}
      <div className="flex items-center gap-[20px] relative">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((dot) => (
          <div
            key={dot}
            className={cn(
              'w-2 h-2 rounded-full relative z-10 transition-colors duration-300',
              dot < step
                ? 'bg-indigo-400'
                : dot === step
                ? 'bg-white'
                : 'bg-[var(--surface-3)]'
            )}
          />
        ))}
        {/* Animated fill bar */}
        <motion.div
          initial={{ width: 8 }}
          animate={{
            width: 8 + (step - 1) * (dotSpacing),
          }}
          className="absolute -left-[4px] top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 0.8,
          }}
        />
      </div>

      {/* Step label */}
      <p className="text-xs text-[var(--text-muted)] tracking-wide">
        Step {step} of {totalSteps}
      </p>

      {/* Nav buttons */}
      <div className="w-full max-w-sm">
        <motion.div
          className="flex items-center gap-2"
          animate={{ justifyContent: isFirst ? 'stretch' : 'space-between' }}
        >
          {!isFirst && (
            <motion.button
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 72 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={onBack}
              className="flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] transition-all"
            >
              Back
            </motion.button>
          )}
          <motion.button
            onClick={onContinue}
            disabled={disabled || loading}
            animate={{ flex: isFirst ? 1 : undefined }}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold transition-all',
              'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
              'hover:from-indigo-500 hover:to-violet-500',
              'shadow-lg shadow-indigo-500/25',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              isFirst ? 'flex-1' : 'flex-1'
            )}
          >
            {loading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                {isLast && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    <CircleCheck size={15} />
                  </motion.div>
                )}
                {isLast ? 'Submit Survey' : 'Continue'}
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
