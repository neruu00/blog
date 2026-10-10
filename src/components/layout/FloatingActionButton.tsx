'use client';

import { Megaphone, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import Tooltip from '@/components/ui/Tooltip';

/** 모바일 드로어(z-40 오버레이, z-50 패널)에 가려지도록 z-30에 둔다. */
export default function FloatingActionButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  // 관리자에게는 글쓰기 버튼, 그 외에는 GitHub 이슈 제보 버튼을 보여준다
  if (session?.user?.isAdmin) {
    return (
      <div className="right-float bottom-float fixed z-30">
        <Tooltip text="글쓰기" position="left">
          <Link
            href="/write"
            className="group size-fab flex items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-xl"
            aria-label="글쓰기"
          >
            <PenSquare className="h-6 w-6 transition-transform group-hover:scale-110" />
          </Link>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="right-float bottom-float fixed z-30">
      <Tooltip text="이슈 제보하기" position="left">
        <Link
          href="https://github.com/neruu00/blog/issues"
          target="_blank"
          rel="noreferrer"
          className="group size-fab flex items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:shadow-xl"
          aria-label="이슈 제보하기"
        >
          <Megaphone className="h-6 w-6 transition-transform group-hover:scale-110" />
        </Link>
      </Tooltip>
    </div>
  );
}
