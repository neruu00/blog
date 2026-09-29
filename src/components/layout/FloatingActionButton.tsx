'use client';

import { Megaphone, PenSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

import Tooltip from '@/components/ui/Tooltip';

export default function FloatingActionButton() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // 포트폴리오(/projects)는 읽는 화면이라 떠 있는 버튼을 띄우지 않는다
  if (status === 'loading' || pathname === '/projects' || pathname.startsWith('/projects/')) {
    return null;
  }

  // 관리자에게는 글쓰기 버튼, 그 외에는 GitHub 이슈 제보 버튼을 보여준다
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

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <Tooltip text="이슈 제보하기" position="left">
        <Link
          href="https://github.com/neruu00/blog/issues"
          target="_blank"
          rel="noreferrer"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:shadow-xl"
          aria-label="이슈 제보하기"
        >
          <Megaphone className="h-6 w-6 transition-transform group-hover:scale-110" />
        </Link>
      </Tooltip>
    </div>
  );
}
