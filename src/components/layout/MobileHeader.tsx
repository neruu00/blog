/**
 * @file MobileHeader.tsx
 * @description 모바일 상단 헤더 컴포넌트.
 *              햄버거 메뉴 버튼과 로고를 표시하며,
 *              Zustand useSidebarStore로 사이드바 열림/닫힘을 제어한다.
 */

'use client';

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { useSidebarStore } from '@/stores/useSidebarStore';

import BlogOwnerProfile from './BlogOwnerProfile';
import LoginButton from './LoginButton';
import NavLinks from './NavLinks';
import ProfileButton from './ProfileButton';

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
        <div className="px-6 pt-2 pb-6">
          <BlogOwnerProfile />
        </div>

        <div className="mx-6 border-t border-gray-100" />

        <nav className="flex flex-1 flex-col gap-1 px-4 pt-4">
          <NavLinks />
        </nav>

        {/* 하단 푸터 / 로그인 영역 */}
        <div className="flex flex-col gap-1 border-t border-gray-100 pt-2 pb-2">
          <div className="px-2">
            {session ? <ProfileButton session={session} /> : <LoginButton />}
          </div>
        </div>
      </div>
    </>
  );
}
