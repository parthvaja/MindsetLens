'use client';

import { LIKERT_OPTIONS } from '@/lib/utils/constants';

interface LikertScaleProps {
  questionId: string;
  value?: number;
  onChange: (value: number) => void;
}

export default function LikertScale({ questionId, value, onChange }: LikertScaleProps) {
  return (
    <div className="space-y-3">
      {LIKERT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={[
            'w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all',
            value === option.value
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50',
          ].join(' ')}
        >
          <span
            className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0',
              value === option.value
                ? 'border-blue-500 bg-blue-500 text-white'
                : 'border-gray-300 text-gray-500',
            ].join(' ')}
          >
            {option.value}
          </span>
          <span className={['font-medium', value === option.value ? 'text-blue-700' : 'text-gray-700'].join(' ')}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}
