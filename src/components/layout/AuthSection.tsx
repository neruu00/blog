/**
 * @file AuthSection.tsx
 * @description 세션 상태에 따라 프로필/로그인 버튼을 렌더링하는 공용 클라이언트 컴포넌트.
 *              SideNav(데스크톱)와 MobileHeader(모바일)의 하단 푸터가 공유한다.
 *
 *              반드시 클라이언트에서 세션을 읽어야 한다: 레이아웃이 force-static(ISR)
 *              경로에 포함되면 서버의 getServerSession은 쿠키를 못 읽어 세션이 항상
 *              null로 구워진다 — 데스크톱 사이드 푸터에 로그인 정보가 안 보이던 원인.
 */

'use client';

import { useSession } from 'next-auth/react';

import Skeleton from '@/components/ui/Skeleton';

import LoginButton from './LoginButton';
import ProfileButton from './ProfileButton';

export default function AuthSection() {
  const { data: session, status } = useSession();

  // 로딩 없는 대기 금지 — 세션 확인 중 "Log in"이 번쩍이지 않도록 스켈레톤 표시
  if (status === 'loading') {
    return <Skeleton className="h-16 w-full rounded-lg" />;
  }

  return session ? <ProfileButton session={session} /> : <LoginButton />;
}
