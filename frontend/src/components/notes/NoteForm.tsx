'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '@/lib/api/analytics';
import Button from '@/components/ui/Button';
import { Calendar, FileText } from 'lucide-react';

const noteSchema = z.object({
  note_text: z.string().min(10, 'Please write at least 10 characters'),
  observation_date: z.string().min(1, 'Please select a date'),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  studentId: string;
  onSuccess?: () => void;
}

const fieldClass =
  'block w-full rounded-lg bg-zinc-800/80 border border-zinc-700 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all';

const labelClass = 'flex items-center gap-1.5 text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2';

export default function NoteForm({ studentId, onSuccess }: NoteFormProps) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: { observation_date: today },
  });

  const mutation = useMutation({
    mutationFn: (data: NoteFormData) =>
      createNote({ student: studentId, ...data }),
    onSuccess: () => {
      toast.success('Observation saved. Recommendations will update shortly.');
      reset({ observation_date: today });
      queryClient.invalidateQueries({ queryKey: ['notes', studentId] });
      queryClient.invalidateQueries({ queryKey: ['recommendations', studentId] });
      onSuccess?.();
    },
    onError: () => {
      toast.error('Failed to save observation.');
    },
  });

  const onSubmit = (data: NoteFormData) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className={labelClass}>
          <Calendar size={11} />
          Observation Date
        </label>
        <input
          type="date"
          max={today}
          {...register('observation_date')}
          className={fieldClass}
          style={{ colorScheme: 'dark' }}
        />
        {errors.observation_date && (
          <p className="mt-1 text-xs text-rose-400">{errors.observation_date.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>
          <FileText size={11} />
          Observation
        </label>
        <textarea
          {...register('note_text')}
          rows={5}
          placeholder="Describe what you observed about the student's mindset, effort, reactions to challenges…"
          className={fieldClass + ' resize-none'}
        />
        {errors.note_text && (
          <p className="mt-1 text-xs text-rose-400">{errors.note_text.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        loading={mutation.isPending}
        variant="primary"
        className="w-full"
      >
        Save Observation
      </Button>

      <p className="text-[10px] text-zinc-600 text-center">
        Saving an observation triggers AI recommendation regeneration
      </p>
    </form>
  );
}
