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
import { AppInput } from '@/components/ui/login-form-visual';
import { Brain, User, Mail, Lock, School } from 'lucide-react';

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
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_32px_rgba(99,102,241,0.35)] mb-4">
            <Brain size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create Account</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5">
            Join MindsetLens as a teacher
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-7 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <AppInput
                placeholder="First name"
                icon={<User size={15} />}
                error={errors.first_name?.message}
                {...register('first_name')}
              />
              <AppInput
                placeholder="Last name"
                icon={<User size={15} />}
                error={errors.last_name?.message}
                {...register('last_name')}
              />
            </div>
            <AppInput
              placeholder="Email address"
              type="email"
              icon={<Mail size={15} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <AppInput
              placeholder="Username"
              icon={<User size={15} />}
              error={errors.username?.message}
              {...register('username')}
            />
            <AppInput
              placeholder="School name (optional)"
              icon={<School size={15} />}
              error={errors.school_name?.message}
              {...register('school_name')}
            />
            <AppInput
              placeholder="Password"
              type="password"
              icon={<Lock size={15} />}
              error={errors.password?.message}
              {...register('password')}
            />
            <AppInput
              placeholder="Confirm password"
              type="password"
              icon={<Lock size={15} />}
              error={errors.password_confirm?.message}
              {...register('password_confirm')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
