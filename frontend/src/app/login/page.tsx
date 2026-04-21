'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { Brain, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

function FloatingInput({
  label,
  type = 'text',
  icon: Icon,
  error,
  ...props
}: {
  label: string;
  type?: string;
  icon: React.ElementType;
  error?: string;
  [key: string]: unknown;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type={type}
          className="w-full h-10 pl-10 pr-4 bg-zinc-800/80 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await login(data);
      setAuth(res.teacher, res.access, res.refresh);
      toast.success(`Welcome back, ${res.teacher.first_name}!`);
      router.replace('/dashboard');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-sky-500/4 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 shadow-[0_0_32px_rgba(6,182,212,0.4)] mb-4"
          >
            <Brain size={22} className="text-zinc-950" />
          </motion.div>
          <h1 className="text-2xl font-heading font-semibold text-zinc-50 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to your MindsetLens account</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FloatingInput
              label="Email address"
              type="email"
              icon={Mail}
              error={errors.email?.message}
              placeholder="you@school.edu"
              {...register('email')}
            />
            <FloatingInput
              label="Password"
              type="password"
              icon={Lock}
              error={errors.password?.message}
              placeholder="••••••••"
              {...register('password')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_16px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">
              New here?{' '}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* AI badge */}
        <div className="flex items-center justify-center gap-2 mt-5 text-xs text-zinc-600">
          <Sparkles size={11} className="text-cyan-500/60" />
            Built for educators
        </div>
      </motion.div>
    </div>
  );
}
