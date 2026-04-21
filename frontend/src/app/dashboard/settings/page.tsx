'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/authStore';
import { User, Mail, School, Shield, Settings } from 'lucide-react';

export default function SettingsPage() {
  const teacher = useAuthStore((s) => s.teacher);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center">
            <Settings size={11} className="text-zinc-400" />
          </div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Settings</span>
        </div>
        <h1 className="text-[28px] font-heading font-semibold text-zinc-50 tracking-tight leading-none">
          Account Settings
        </h1>
        <p className="text-sm text-zinc-500 mt-1.5">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <User size={16} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Profile</h2>
            <p className="text-xs text-zinc-500">Your account information</p>
          </div>
        </div>

        <dl className="space-y-2.5">
          {[
            { Icon: User, label: 'Name', value: `${teacher?.first_name} ${teacher?.last_name}` },
            { Icon: Mail, label: 'Email', value: teacher?.email },
            ...(teacher?.school_name ? [{ Icon: School, label: 'School', value: teacher.school_name }] : []),
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-3.5 rounded-lg bg-zinc-800/60 border border-zinc-800">
              <Icon size={14} className="text-zinc-600 shrink-0" />
              <dt className="w-24 text-xs font-medium text-zinc-500 uppercase tracking-wide shrink-0">{label}</dt>
              <dd className="text-sm text-zinc-200">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Security */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Shield size={16} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Security</h2>
            <p className="text-xs text-zinc-500">Authentication & data protection</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { label: 'JWT Authentication', desc: 'Your session is secured with JWT tokens' },
            { label: 'Data Encryption', desc: 'All data is transmitted over HTTPS' },
            { label: 'Student Privacy', desc: 'Student data is only visible to you' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-lg bg-zinc-800/60 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] shrink-0" />
              <div>
                <p className="text-xs font-medium text-zinc-200">{item.label}</p>
                <p className="text-[10px] text-zinc-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
