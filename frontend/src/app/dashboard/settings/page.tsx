'use client';

import { useAuthStore } from '@/lib/store/authStore';
import Card from '@/components/ui/Card';
import { User, Mail, School, Shield } from 'lucide-react';

export default function SettingsPage() {
  const teacher = useAuthStore((s) => s.teacher);

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your account preferences
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center">
            <User size={16} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profile</h2>
            <p className="text-xs text-[var(--text-muted)]">Your account information</p>
          </div>
        </div>

        <dl className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            <User size={14} className="text-[var(--text-muted)] shrink-0" />
            <dt className="w-28 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide shrink-0">
              Name
            </dt>
            <dd className="text-sm text-[var(--text-primary)]">
              {teacher?.first_name} {teacher?.last_name}
            </dd>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
            <Mail size={14} className="text-[var(--text-muted)] shrink-0" />
            <dt className="w-28 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide shrink-0">
              Email
            </dt>
            <dd className="text-sm text-[var(--text-primary)]">{teacher?.email}</dd>
          </div>

          {teacher?.school_name && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
              <School size={14} className="text-[var(--text-muted)] shrink-0" />
              <dt className="w-28 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide shrink-0">
                School
              </dt>
              <dd className="text-sm text-[var(--text-primary)]">{teacher.school_name}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Shield size={16} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Security</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Authentication & data protection
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'JWT Authentication', desc: 'Your session is secured with JWT tokens', ok: true },
            { label: 'Data Encryption', desc: 'All data is transmitted over HTTPS', ok: true },
            { label: 'Student Privacy', desc: 'Student data is only visible to you', ok: true },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)] shrink-0" />
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{item.label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
