'use client';

import { PenBox } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Tooltip from './Tooltip';

export default function WriteLinkButton() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/write' || pathname.startsWith('/edit/')) {
    return null;
  }

  return (
    <Link href="/write" className="fixed right-6 bottom-6 z-50">
      <Tooltip content="글쓰기">
        <div className="rounded-full bg-brand p-4 shadow-lg hover:bg-cyan-500 active:bg-cyan-600 transition-colors">
          <PenBox color="white" />
        </div>
      </Tooltip>
    </Link>
  );
}
