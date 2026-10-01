/**
 * @file page.tsx
 * @description 포트폴리오 바탕화면. 창 없이 레이아웃의 바탕화면 아이콘만 보여준다.
 */

import { PROFILE } from '@/lib/constants/portfolio';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: PROFILE.summary,
  openGraph: {
    title: `${PROFILE.name} · ${PROFILE.title}`,
    description: PROFILE.summary,
  },
};

export default function PortfolioDesktopPage() {
  return (
    <h1 className="sr-only">
      {PROFILE.name} · {PROFILE.title} 포트폴리오
    </h1>
  );
}
