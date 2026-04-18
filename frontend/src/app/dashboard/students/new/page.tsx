'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createStudent } from '@/lib/api/students';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { GRADE_CHOICES, GENDER_CHOICES } from '@/lib/utils/constants';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
      toast.success(`${student.full_name} added successfully!`);
      router.push(`/dashboard/students/${student.id}`);
    } catch {
      // error toast from interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/students"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Students
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Student</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Last name"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
              <select
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('grade_level')}
              >
                <option value="">Select grade</option>
                {GRADE_CHOICES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <Input
              label="Age"
              type="number"
              min={4}
              max={19}
              error={errors.age?.message}
              {...register('age')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('gender')}
            >
              <option value="">Prefer not to say</option>
              {GENDER_CHOICES.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial notes (optional)
            </label>
            <textarea
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Any relevant background information..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/students" className="flex-1">
              <Button variant="secondary" className="w-full">Cancel</Button>
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
