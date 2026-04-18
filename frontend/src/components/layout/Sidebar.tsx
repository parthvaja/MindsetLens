'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/store/authStore';
import { logout } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { href: '/dashboard/students', label: 'Students', Icon: UsersIcon },
  { href: '/dashboard/settings', label: 'Settings', Icon: Cog6ToothIcon },
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
      const storedRefresh = typeof window !== 'undefined'
        ? localStorage.getItem('refresh_token')
        : null;
      if (storedRefresh) await logout(storedRefresh);
    } catch {
      // swallow — still clear local auth
    } finally {
      clearAuth();
      toast.success('Logged out');
      router.replace('/login');
    }
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-xl font-bold text-blue-400">MindsetLens</span>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{teacher?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
              ].join(' ')}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-700">
        <div className="px-3 py-2 mb-1">
          <p className="text-sm font-medium text-white truncate">
            {teacher?.first_name} {teacher?.last_name}
          </p>
          {teacher?.school_name && (
            <p className="text-xs text-gray-400 truncate">{teacher.school_name}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
