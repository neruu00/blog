import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Geist, Geist_Mono, Nanum_Pen_Script } from 'next/font/google';

import CursorParticles from '@/components/CursorParticles';
import WriteLinkButton from '@/components/WriteLinkButton';
import TanstackQueryLayout from '@/layouts/TanstackQueryLayout';

import type { Metadata } from 'next';

import 'highlight.js/styles/atom-one-dark.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const nanumPen = Nanum_Pen_Script({
  variable: '--font-nanum-pen',
  weight: '400',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | neruu00.log',
    default: 'neruu00.log - Developer Blog',
  },
  description: 'Jaehyeon Woo (neruu00) Developer Blog',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} ${nanumPen.variable} font-sans text-slate-900 relative antialiased min-h-screen bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-slate-50 dark:bg-slate-900 dark:text-slate-100`}>
        <CursorParticles />
        <TanstackQueryLayout>
            {children}
            <WriteLinkButton />
        </TanstackQueryLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
