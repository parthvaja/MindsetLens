'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 30_000 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#181c23',
            color: '#e2e8f0',
            border: '1px solid #1e2330',
            borderRadius: '10px',
            fontSize: '13px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#181c23' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#181c23' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
