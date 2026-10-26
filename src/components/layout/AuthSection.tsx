/**
 * @file AuthSection.tsx
 * @description 세션 상태에 따라 프로필 또는 로그인 버튼을 보여준다. SideNav와 MobileHeader 하단에서 함께 쓴다.
 *
 *              세션은 반드시 클라이언트에서 읽는다. 레이아웃이 force-static(ISR) 경로에 포함되면
 *              서버의 getServerSession이 쿠키를 읽지 못해 세션이 항상 null로 고정된다.
 */

'use client';

import { useSession } from 'next-auth/react';

import Skeleton from '@/components/ui/Skeleton';

import LoginButton from './LoginButton';
import ProfileButton from './ProfileButton';

export default function AuthSection() {
  const { data: session, status } = useSession();

  // 대부분은 비로그인 방문자라 로그인 아이콘 크기만큼만 자리를 잡는다
  if (status === 'loading') {
    return <Skeleton className="size-9 rounded-lg" />;
  }

  return session ? <ProfileButton session={session} /> : <LoginButton />;
}
