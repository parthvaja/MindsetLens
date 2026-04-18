'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { register as registerTeacher } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const schema = z
  .object({
    first_name: z.string().min(1, 'Required'),
    last_name: z.string().min(1, 'Required'),
    email: z.string().email('Invalid email'),
    username: z.string().min(3, 'At least 3 characters'),
    school_name: z.string().optional(),
    password: z.string().min(8, 'At least 8 characters'),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await registerTeacher(data);
      setAuth(res.teacher, res.access, res.refresh);
      toast.success('Account created! Welcome to MindsetLens.');
      router.replace('/dashboard');
    } catch {
      // error toast handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">MindsetLens</h1>
          <p className="text-gray-500 mt-2">Create your teacher account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Input
              label="Email address"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Username"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="School name (optional)"
              error={errors.school_name?.message}
              {...register('school_name')}
            />
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm password"
              type="password"
              error={errors.password_confirm?.message}
              {...register('password_confirm')}
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
