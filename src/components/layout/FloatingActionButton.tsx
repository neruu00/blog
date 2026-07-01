'use client';

import { Megaphone, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Tooltip from '@/components/ui/Tooltip';

export default function FloatingActionButton() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // 현재 경로가 글쓰기 페이지면 아무 플로팅 버튼도 보여주지 않음
  if (pathname === '/write') {
    return null;
  }

  // 관리자 권한인 경우: 주황색 글쓰기 버튼
  if (session?.user?.isAdmin) {
    return (
      <div className="fixed right-6 bottom-6 z-50">
        <Tooltip text="글쓰기" position="left">
          <Link
            href="/write"
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-xl"
            aria-label="글쓰기"
          >
            <PenSquare className="h-6 w-6 transition-transform group-hover:scale-110" />
          </Link>
        </Tooltip>
      </div>
    );
  }

  // 일반 유저이거나 로그인하지 않은 경우: 파란색/검은색 등 다른 테마의 이슈 제보 버튼
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <Tooltip text="이슈 제보하기" position="left">
        <Link
          href="https://github.com/neruu00/blog/issues"
          target="_blank"
          rel="noreferrer"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-900 hover:shadow-xl"
          aria-label="이슈 제보하기"
        >
          <Megaphone className="h-6 w-6 transition-transform group-hover:scale-110" />
        </Link>
      </Tooltip>
    </div>
  );
}
