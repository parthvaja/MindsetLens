'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Home, Users, Settings, LogOut, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/dashboard/students', label: 'Students', Icon: Users },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { teacher, clearAuth } = useAuthStore((s) => ({
    teacher: s.teacher,
    clearAuth: s.clearAuth,
  }));

  const handleLogout = async () => {
    try {
      const storedRefresh =
        typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (storedRefresh) await logout(storedRefresh);
    } catch {
      // swallow — still clear local auth
    } finally {
      clearAuth();
      toast.success('Logged out');
      router.replace('/login');
    }
  };

  const initials = `${teacher?.first_name?.[0] ?? ''}${teacher?.last_name?.[0] ?? ''}`;

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[var(--surface)] border-r border-[var(--border)] shrink-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
            <Brain size={15} className="text-white" />
          </div>
          <div>
            <span className="text-[var(--text-primary)] font-bold text-sm tracking-tight">
              MindsetLens
            </span>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2.5 truncate flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          {teacher?.email}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
          Navigation
        </p>
        {navItems.map(({ href, label, Icon }) => {
          const active =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-500/15 text-indigo-300 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon
                size={15}
                className={active ? 'text-indigo-400' : 'text-[var(--text-muted)]'}
              />
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI badge */}
      <div className="mx-3 mb-3">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500/8 to-violet-500/8 border border-indigo-500/15">
          <Sparkles size={13} className="text-indigo-400 shrink-0" />
          <div>
            <p className="text-[11px] font-semibold text-indigo-300">AI-Powered</p>
            <p className="text-[10px] text-[var(--text-muted)]">Claude Sonnet 4.5</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border border-[var(--border)] flex items-center justify-center text-[11px] font-bold text-[var(--text-primary)] shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
              {teacher?.first_name} {teacher?.last_name}
            </p>
            {teacher?.school_name && (
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                {teacher.school_name}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
