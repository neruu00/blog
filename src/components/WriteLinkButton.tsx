'use client';

import { PenBox } from 'lucide-react';
import Link from 'next/link';

import Tooltip from './Tooltip';
import { usePathname } from 'next/navigation';

export default function WriteLinkButton() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/write' || pathname.startsWith('/edit/')) {
    return null;
  }

  return (
    <Link href="/write" className="fixed right-6 bottom-6 z-100">
      <Tooltip content="글쓰기">
        <div className="rounded-full bg-orange-500 p-4 hover:bg-orange-600 active:bg-orange-700">
          <PenBox color="white" />
        </div>
      </Tooltip>
    </Link>
  );
}
