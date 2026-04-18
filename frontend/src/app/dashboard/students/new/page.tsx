'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createStudent } from '@/lib/api/students';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { GRADE_CHOICES, GENDER_CHOICES } from '@/lib/utils/constants';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  age: z.coerce.number().min(4).max(19).optional().or(z.literal('')),
  grade_level: z.string().optional(),
  gender: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const fieldClass =
  'block w-full rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all';

const labelClass = 'block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1.5';

const errorClass = 'text-xs text-red-400 mt-1';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const student = await createStudent({
        first_name: data.first_name,
        last_name: data.last_name,
        age: data.age ? Number(data.age) : undefined,
        grade_level: data.grade_level as never,
        gender: data.gender as never,
        notes: data.notes,
      });
      toast.success(`${student.full_name} added!`);
      router.push(`/dashboard/students/${student.id}`);
    } catch {
      // error toast from interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-6 transition-colors"
      >
        <ArrowLeft size={12} />
        Back to Students
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
          <UserPlus size={16} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Add New Student</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Create a student profile to begin assessments
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First name</label>
              <input
                className={fieldClass}
                placeholder="Alice"
                {...register('first_name')}
              />
              {errors.first_name && (
                <p className={errorClass}>{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                className={fieldClass}
                placeholder="Johnson"
                {...register('last_name')}
              />
              {errors.last_name && (
                <p className={errorClass}>{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Grade Level</label>
              <select
                className={fieldClass}
                style={{ colorScheme: 'dark' }}
                {...register('grade_level')}
              >
                <option value="">Select grade</option>
                {GRADE_CHOICES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                min={4}
                max={19}
                placeholder="12"
                className={fieldClass}
                {...register('age')}
              />
              {errors.age && <p className={errorClass}>{errors.age.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <select
              className={fieldClass}
              style={{ colorScheme: 'dark' }}
              {...register('gender')}
            >
              <option value="">Prefer not to say</option>
              {GENDER_CHOICES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Initial notes (optional)</label>
            <textarea
              rows={3}
              className={fieldClass}
              placeholder="Any relevant background information..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Link href="/dashboard/students" className="flex-1">
              <Button variant="secondary" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} className="flex-1">
              Add Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
