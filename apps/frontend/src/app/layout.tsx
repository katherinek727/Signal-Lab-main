import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { NavBar } from '@/components/layout/nav-bar';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Signal Lab',
    template: '%s — Signal Lab',
  },
  description: 'Observability playground — generate real metrics, logs and errors on demand',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen`}>
        <Providers>
          {/* Subtle grid background pattern */}
          <div className="fixed inset-0 -z-10 bg-background">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            {/* Radial glow top-right */}
            <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
            {/* Radial glow bottom-left */}
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
          </div>

          <NavBar />

          <div className="animate-slide-up">
            {children}
          </div>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
