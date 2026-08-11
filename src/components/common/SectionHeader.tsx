/**
 * @file SectionHeader.tsx
 * @description 섹션 제목 + 우측 "전체 보기" 링크. 홈의 뉴스/최신 글 섹션 등에서 사용.
 */

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  /** 지정하면 우측에 "전체 보기 →" 링크가 표시된다 */
  href?: string;
  linkText?: string;
}

export default function SectionHeader({ title, href, linkText = '전체 보기' }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-3">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {href && (
        <Link
          href={href}
          className="group flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-orange-500"
        >
          {linkText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
