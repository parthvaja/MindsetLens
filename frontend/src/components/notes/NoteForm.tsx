'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote } from '@/lib/api/analytics';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const noteSchema = z.object({
  note_text: z.string().min(10, 'Please write at least 10 characters'),
  observation_date: z.string().min(1, 'Please select a date'),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface NoteFormProps {
  studentId: string;
  onSuccess?: () => void;
}

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observation Date
        </label>
        <input
          type="date"
          max={today}
          {...register('observation_date')}
          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
        {errors.observation_date && (
          <p className="mt-1 text-xs text-red-500">{errors.observation_date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observation
        </label>
        <textarea
          {...register('note_text')}
          rows={4}
          placeholder="Describe what you observed about the student's mindset, effort, reactions to challenges…"
          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
        />
        {errors.note_text && (
          <p className="mt-1 text-xs text-red-500">{errors.note_text.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        loading={mutation.isPending}
        className="w-full"
      >
        Save Observation
      </Button>
    </form>
  );
}
