'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { AppInput } from '@/components/ui/login-form-visual';
import { Mail, Lock} from 'lucide-react';
import Image from 'next/image';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await login(data);
      setAuth(res.teacher, res.access, res.refresh);
      toast.success(`Welcome back, ${res.teacher.first_name}!`);
      router.replace('/dashboard');
    } catch (err) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <div className='flex w-full max-w-5xl h-[600px] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden'>
        
        {/* Left Section: Form */}
        <div 
          className='w-full lg:w-1/2 px-8 lg:px-16 flex flex-col justify-center relative'
          onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
        >
          {/* Animated Background Blur */}
          <div 
            className="absolute pointer-events-none w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] transition-opacity"
            style={{
              left: mousePosition.x - 200,
              top: mousePosition.y - 200,
              transition: 'transform 0.2s ease-out'
            }}
          />

          <div className="z-10 w-full">
            <div className="text-center mb-8">
              <h1 className='text-4xl font-extrabold mb-2'>Sign In</h1>
              <p className="text-[var(--color-text-secondary)]">Access your MindsetLens dashboard</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
              <AppInput 
                placeholder="Email address" 
                type="email"
                icon={<Mail size={18} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <AppInput 
                placeholder="Password" 
                type="password"
                icon={<Lock size={18} />}
                error={errors.password?.message}
                {...register('password')}
              />
              
              <button 
                type="submit"
                disabled={loading}
                className="relative w-full py-3 rounded-md bg-[var(--color-text-primary)] text-[var(--color-bg)] font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                New here? <Link href="/register" className="text-[var(--color-text-primary)] hover:underline">Create an account</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Image/Visual */}
        <div className='hidden lg:block w-1/2 relative'>
          <Image
            src='https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop'
            alt="Education concept"
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[var(--color-surface)]" />
          <div className="absolute bottom-12 left-12 right-12">
            <h2 className="text-2xl font-bold text-white mb-2">Empowering Growth</h2>
            <p className="text-gray-300 text-sm">Visualize student progress and unlock their potential with AI-driven insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
}