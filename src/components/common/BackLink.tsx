/**
 * @file BackLink.tsx
 * @description 상세 페이지 상단의 "← 목록으로" 뒤로가기 링크.
 */

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-8 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-orange-500"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  );
}
