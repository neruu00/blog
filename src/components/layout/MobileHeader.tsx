/**
 * @file MobileHeader.tsx
 * @description 모바일 상단 헤더. 햄버거 버튼으로 슬라이드 메뉴를 열고 닫으며, 상태는 useSidebarStore가 가진다.
 */

'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import Button from '@/components/ui/Button';
import { useSidebarStore } from '@/stores/useSidebarStore';

import AuthSection from './AuthSection';
import BlogOwnerProfile from './BlogOwnerProfile';
import NavLinks from './NavLinks';

export default function MobileHeader() {
  const pathname = usePathname();
  const isOpen = useSidebarStore((state) => state.isOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const close = useSidebarStore((state) => state.close);

  // 페이지를 이동하면 메뉴를 닫는다
  useEffect(() => {
    close();
  }, [pathname, close]);

  // 메뉴가 열려 있는 동안 뒤쪽 페이지가 스크롤되지 않게 막는다
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
      <header className="fixed top-0 left-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="text-lg font-bold text-gray-900">
          neruu00<span className="text-orange-500">.log</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 flex h-screen w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end px-4 pt-4">
          <Button variant="ghost" size="icon" onClick={close} aria-label="메뉴 닫기">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-6 pt-2 pb-6">
          <BlogOwnerProfile />
        </div>

        <div className="mx-6 border-t border-gray-100" />

        <nav className="flex flex-1 flex-col gap-1 px-4 pt-4">
          <NavLinks />
        </nav>

        <div className="flex flex-col gap-1 border-t border-gray-100 pt-2 pb-2">
          <div className="px-2">
            <AuthSection />
          </div>
        </div>
      </div>
    </>
  );
}
