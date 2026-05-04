/**
 * @file SideNav.tsx
 * @description 데스크톱 사이드 네비게이션 컴포넌트.
 *              좌측에 고정 배치되어 로고, 프로필, 메뉴 링크를 표시한다.
 *              상단을 최대한 비워 y축으로 넓은 느낌을 제공.
 */

import Image from 'next/image';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import AuthButtons from './AuthButtons';
import NavLinks from './NavLinks';

export default async function SideNav() {
  const session = await getServerSession(authOptions);

  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-100 bg-white lg:flex">
      {/* 프로필 영역 */}
      <div className="flex flex-col items-center px-6 pt-10 pb-6">
        <div className="relative mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-orange-100 bg-orange-50">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || '프로필'}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <span className="text-2xl font-bold text-orange-300">N</span>
          )}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{session?.user?.name || 'neruu00.log'}</h2>
        {session?.user?.email && <p className="text-sm text-gray-400">{session.user.email}</p>}
        <p className="mt-1 text-xs text-gray-400">Developer</p>
      </div>

      {/* 구분선 */}
      <div className="mx-6 border-t border-gray-100" />

      {/* 네비게이션 메뉴 */}
      <nav className="flex flex-1 flex-col gap-1 px-4 pt-6">
        <NavLinks />
      </nav>

      {/* 하단 — 로그인/Write 버튼 영역 */}
      <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-4">
        <AuthButtons />
      </div>

      {/* 푸터 */}
      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-gray-300">© 2026 neruu00</p>
      </div>
    </aside>
  );
}
