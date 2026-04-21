import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-8">
            {children}
          </div>
        </main>
        <CommandPalette />
      </div>
    </ProtectedRoute>
  );
}
