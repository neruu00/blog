/**
 * @file SideNav.tsx
 * @description 데스크톱 좌측에 고정되는 사이드 내비게이션. 프로필, 메뉴 링크, 로그인 영역을 보여준다.
 */

import AuthSection from './AuthSection';
import BlogOwnerProfile from './BlogOwnerProfile';
import NavLinks from './NavLinks';

export default function SideNav() {
  return (
    <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-100 bg-white lg:flex">
      <div className="px-6 pt-20 pb-6">
        <BlogOwnerProfile />
      </div>

      <div className="mx-6 border-t border-gray-100" />

      <nav className="flex flex-1 flex-col gap-1 px-4 pt-6">
        <NavLinks />
      </nav>

      <div className="flex flex-col gap-1 border-t border-gray-100 pt-2 pb-2">
        <div className="px-2">
          <AuthSection />
        </div>
      </div>
    </aside>
  );
}
