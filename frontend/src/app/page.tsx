'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Sparkles,
  ClipboardList,
  ArrowRight,
  Check,
  BarChart2,
  MessageSquare,
  Users,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const features = [
  {
    icon: ClipboardList,
    title: '12-Question Surveys',
    desc: 'Structured assessments using Likert scale and open-ended questions based on Carol Dweck\'s research.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Brain,
    title: 'AI Scoring Engine',
    desc: 'NLP-powered analysis calculates growth mindset scores with sub-200ms response times.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: Sparkles,
    title: 'Claude Recommendations',
    desc: 'Claude AI generates 4-5 personalized, actionable teaching strategies per student.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Trend Analytics',
    desc: 'Track mindset evolution over time with interactive charts and historical data.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Teacher Observations',
    desc: 'Add behavioral notes that trigger AI recommendation updates in real-time.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: BarChart2,
    title: 'Class Dashboard',
    desc: 'Bird\'s-eye view of your entire class with mindset distribution and quick filters.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
];

const stats = [
  { value: '< 200ms', label: 'API response time' },
  { value: '50+', label: 'Concurrent users' },
  { value: '12', label: 'Assessment questions' },
  { value: '4-5', label: 'AI recommendations' },
];

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-x-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.4)]">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-[var(--text-primary)] tracking-tight">MindsetLens</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 border border-indigo-500/40"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-28 max-w-4xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8">
            <Sparkles size={11} />
            Powered by Claude AI · Built for educators
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6"
        >
          Understand your students&apos;{' '}
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            learning mindset
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          MindsetLens uses AI to analyse student surveys and observations, then generates
          personalised teaching strategies based on Carol Dweck&apos;s growth mindset research.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold transition-all shadow-[0_8px_30px_rgba(99,102,241,0.3)] border border-indigo-500/30"
          >
            Start for free
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium hover:bg-[var(--surface-2)] transition-all text-sm"
          >
            Sign in to dashboard
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 text-center"
            >
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-28">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3"
          >
            Platform Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold text-[var(--text-primary)]"
          >
            Everything you need to support your students
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 hover:border-[var(--surface-3)] transition-all group"
            >
              <div
                className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border mb-4 ${feature.bg}`}
              >
                <feature.icon size={17} className={feature.color} />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
            How It Works
          </p>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            From survey to strategy in minutes
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              step: '01',
              title: 'Add your students',
              desc: 'Create student profiles with grade level, age, and any existing notes.',
              icon: Users,
            },
            {
              step: '02',
              title: 'Conduct assessments',
              desc: 'Walk through the 12-question survey with your student on your device.',
              icon: ClipboardList,
            },
            {
              step: '03',
              title: 'Get AI insights',
              desc: 'Receive a mindset score, classification, and Claude-generated teaching strategies.',
              icon: Sparkles,
            },
            {
              step: '04',
              title: 'Track & refine',
              desc: 'Add observations over time to keep recommendations up to date.',
              icon: TrendingUp,
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-5 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5"
            >
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 shrink-0 mt-0.5 tabular-nums">
                {item.step}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon size={14} className="text-[var(--text-muted)]" />
                  <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/25 rounded-2xl p-10 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_30px_rgba(99,102,241,0.4)] mb-5">
              <Brain size={22} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
              Ready to transform your teaching?
            </h2>
            <p className="text-[var(--text-secondary)] mb-7 max-w-lg mx-auto">
              Join educators using MindsetLens to unlock student potential through
              data-driven insights.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
              {['Free to get started', 'No credit card required', 'AI-powered analysis'].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"
                  >
                    <Check size={11} className="text-emerald-400" />
                    {item}
                  </span>
                )
              )}
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold transition-all shadow-[0_8px_30px_rgba(99,102,241,0.35)]"
            >
              Get started for free
              <ArrowRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Brain size={12} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-secondary)]">MindsetLens</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            AI-powered teacher analytics · Built with Claude
          </p>
        </div>
      </footer>
    </div>
  );
}
