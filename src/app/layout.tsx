/**
 * @file layout.tsx
 * @description 루트 레이아웃. AuthProvider, 폰트, 전역 모달·토스트, 분석 도구를 설정한다.
 *              화면 골격(SideNav 등)은 라우트 그룹 레이아웃이 맡는다.
 */

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Geist_Mono } from 'next/font/google';
import Script from 'next/script';

import Modal from '@/components/ui/Modal';
import ToastContainer from '@/components/ui/ToastContainer';
import AuthProvider from '@/providers/AuthProvider';

import type { Metadata } from 'next';

import 'highlight.js/styles/atom-one-dark.css';
import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
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
      <body
        className={`${geistMono.variable} bg-surface min-h-screen font-sans text-gray-900 antialiased`}
      >
        <AuthProvider>
          {children}
          <ToastContainer />
          <Modal />
        </AuthProvider>
        <Analytics />
        <SpeedInsights />

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZL70EZYFER"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZL70EZYFER');
          `}
        </Script>
      </body>
    </html>
  );
}
