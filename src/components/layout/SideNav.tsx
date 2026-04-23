/**
 * @file SideNav.tsx
 * @description 데스크톱 사이드 네비게이션 컴포넌트.
 *              좌측에 고정 배치되어 로고, 프로필, 메뉴 링크를 표시한다.
 *              상단을 최대한 비워 y축으로 넓은 느낌을 제공.
 */

'use client';

import { Home, FileText, Briefcase, PenSquare, LogOut, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

/** 네비게이션 메뉴 항목 */
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
] as const;

export default function SideNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  /**
   * 현재 경로가 해당 메뉴 항목과 매칭되는지 판별
   * - Home은 정확히 '/'일 때만 활성
   * - 나머지는 경로 prefix로 판별
   */
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

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
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                active
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 하단 — 로그인/Write 버튼 영역 */}
      <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-4">
        {/* @ts-ignore - session.user.isAdmin 커스텀 속성 */}
        {session?.user && (session.user as any).isAdmin && (
          <Link
            href="/write"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            <PenSquare className="h-4 w-4" />
            Write
          </Link>
        )}

        {session ? (
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogIn className="h-4 w-4" />
            Log in
          </button>
        )}
      </div>

      {/* 푸터 */}
      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-gray-300">© 2026 neruu00</p>
      </div>
    </aside>
  );
}
