'use client';

import { useAuthStore } from '@/lib/store/authStore';
import Card from '@/components/ui/Card';

export default function SettingsPage() {
  const teacher = useAuthStore((s) => s.teacher);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Profile</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500">Name</dt>
            <dd className="text-gray-900">{teacher?.first_name} {teacher?.last_name}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500">Email</dt>
            <dd className="text-gray-900">{teacher?.email}</dd>
          </div>
          {teacher?.school_name && (
            <div className="flex gap-4">
              <dt className="w-32 text-gray-500">School</dt>
              <dd className="text-gray-900">{teacher.school_name}</dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}
