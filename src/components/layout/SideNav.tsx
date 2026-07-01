/**
 * @file SideNav.tsx
 * @description 데스크톱 사이드 네비게이션 컴포넌트.
 *              좌측에 고정 배치되어 로고, 프로필, 메뉴 링크를 표시한다.
 *              상단을 최대한 비워 y축으로 넓은 느낌을 제공.
 */

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import BlogOwnerProfile from './BlogOwnerProfile';
import LoginButton from './LoginButton';
import NavLinks from './NavLinks';
import ProfileButton from './ProfileButton';

export default async function SideNav() {
  const session = await getServerSession(authOptions);

  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-100 bg-white lg:flex">
      {/* 프로필 영역 */}
      <div className="px-6 pt-20 pb-6">
        <BlogOwnerProfile />
      </div>

      {/* 구분선 */}
      <div className="mx-6 border-t border-gray-100" />

      {/* 네비게이션 메뉴 */}
      <nav className="flex flex-1 flex-col gap-1 px-4 pt-6">
        <NavLinks />
      </nav>

      {/* 하단 푸터 / 로그인 영역 */}
      <div className="flex flex-col gap-1 border-t border-gray-100 pt-2 pb-2">
        <div className="px-2">
          {session ? <ProfileButton session={session} /> : <LoginButton />}
        </div>
      </div>
    </aside>
  );
}
