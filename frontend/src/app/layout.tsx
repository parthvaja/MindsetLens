import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'MindsetLens — AI Teacher Analytics',
  description: 'AI-powered platform to identify student learning mindsets and personalise teaching strategies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakartaSans.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--bg)] text-[var(--text-primary)] antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
