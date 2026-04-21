'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/authStore';
import { logout } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import {
  Home,
  Users,
  Settings,
  LogOut,
  Brain,
  Sparkles,
  BookOpen,
  Search,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/dashboard/students', label: 'Students', Icon: Users },
  { href: '/dashboard/study-plans', label: 'Study Plans', Icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', Icon: Settings },
];

// Unique colors per student avatar (cycling palette)
const AVATAR_COLORS = [
  'from-cyan-500/20 to-sky-500/20 border-cyan-500/20 text-cyan-300',
  'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-300',
  'from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-300',
  'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-300',
  'from-rose-500/20 to-pink-500/20 border-rose-500/20 text-rose-300',
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
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
      // swallow
    } finally {
      clearAuth();
      toast.success('Logged out');
      router.replace('/login');
    }
  };

  const initials = `${teacher?.first_name?.[0] ?? ''}${teacher?.last_name?.[0] ?? ''}`;
  const avatarColor = AVATAR_COLORS[0];

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        animate={{ width: expanded ? 240 : 56 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative flex flex-col min-h-screen bg-zinc-950 border-r border-zinc-800/60 shrink-0 overflow-hidden z-30"
      >
        {/* Brand */}
        <div className="flex items-center h-14 px-3.5 border-b border-zinc-800/60 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0">
            <Brain size={14} className="text-zinc-950" />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="ml-3 overflow-hidden whitespace-nowrap"
              >
                <span className="font-heading font-bold text-sm tracking-tight text-zinc-50">
                  MindsetLens
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search hint */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="mx-2.5 mt-3 overflow-hidden"
            >
              <button
                onClick={() => {
                  // Trigger command palette
                  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                  document.dispatchEvent(event);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-zinc-500 text-xs hover:bg-zinc-800 hover:border-zinc-600 transition-all"
              >
                <Search size={12} />
                <span>Search...</span>
                <kbd className="ml-auto flex items-center gap-0.5 text-[10px] font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">
                  ⌘K
                </kbd>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
          {!expanded && (
            <p className="h-0" />
          )}
          {expanded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600"
            >
              Menu
            </motion.p>
          )}
          {navItems.map(({ href, label, Icon }) => {
            const active =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href));

            if (!expanded) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        'flex items-center justify-center w-8 h-8 mx-auto rounded-lg transition-all duration-150',
                        active
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
                      )}
                    >
                      <Icon size={16} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap overflow-hidden',
                  active
                    ? 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-500 pl-[10px]'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 border-l-2 border-transparent pl-[10px]'
                )}
              >
                <Icon
                  size={16}
                  className={active ? 'text-cyan-400 shrink-0' : 'text-zinc-500 shrink-0'}
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 }}
                >
                  {label}
                </motion.span>
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI badge */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-2.5 mb-3"
            >
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/8 to-sky-500/8 border border-cyan-500/15">
                <Sparkles size={12} className="text-cyan-400 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-[11px] font-semibold text-cyan-300 whitespace-nowrap">AI-Powered</p>
                  <p className="text-[10px] text-zinc-500 whitespace-nowrap">Claude Sonnet 4.6</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!expanded && (
          <div className="flex justify-center mb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-5 h-5 rounded-full bg-cyan-400/20 flex items-center justify-center">
                  <Sparkles size={10} className="text-cyan-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Claude Sonnet 4.6</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Footer */}
        <div className="px-2 pb-3 pt-3 border-t border-zinc-800/60 shrink-0">
          {expanded ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full bg-gradient-to-br border flex items-center justify-center text-[11px] font-bold shrink-0',
                    avatarColor
                  )}
                >
                  {initials}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="text-xs font-semibold text-zinc-200 truncate whitespace-nowrap">
                    {teacher?.first_name} {teacher?.last_name}
                  </p>
                  {teacher?.school_name && (
                    <p className="text-[10px] text-zinc-500 truncate whitespace-nowrap">
                      {teacher.school_name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
              >
                <LogOut size={13} />
                <span className="whitespace-nowrap">Sign out</span>
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full bg-gradient-to-br border flex items-center justify-center text-[11px] font-bold cursor-default',
                      avatarColor
                    )}
                  >
                    {initials}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {teacher?.first_name} {teacher?.last_name}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-600 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                  >
                    <LogOut size={13} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
