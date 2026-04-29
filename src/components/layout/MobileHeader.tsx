/**
 * @file MobileHeader.tsx
 * @description 모바일 상단 헤더 컴포넌트.
 *              햄버거 메뉴 버튼과 로고를 표시하며,
 *              Zustand useSidebarStore로 사이드바 열림/닫힘을 제어한다.
 */

'use client';

import { Home, FileText, Briefcase, PenSquare, Menu, X, LogOut, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { useSidebarStore } from '@/stores/useSidebarStore';

/** 모바일 메뉴 항목 (SideNav와 동일) */
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
] as const;

export default function MobileHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const close = useSidebarStore((state) => state.close);

  // 페이지 이동 시 사이드바 자동 닫기
  useEffect(() => {
    close();
  }, [pathname, close]);

  // 사이드바 열림 시 body 스크롤 잠금
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* 고정 헤더 */}
      <header className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="text-lg font-bold text-gray-900">
          neruu00<span className="text-orange-500">.log</span>
        </Link>
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* 슬라이드 메뉴 */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-screen w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 닫기 버튼 */}
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            onClick={close}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 프로필 */}
        <div className="flex flex-col items-center px-6 pb-6">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-orange-100 bg-orange-50">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || '프로필'}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <span className="text-xl font-bold text-orange-300">N</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {session?.user?.name || 'neruu00.log'}
          </h2>
          <p className="text-sm text-gray-400">Developer Blog</p>
        </div>

        <div className="mx-6 border-t border-gray-100" />

        {/* 메뉴 */}
        <nav className="flex flex-1 flex-col gap-1 px-4 pt-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
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
      </div>
    </>
  );
}
