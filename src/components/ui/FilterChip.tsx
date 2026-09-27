/**
 * @file FilterChip.tsx
 * @description 태그·뉴스 소스 필터에 쓰는 알약 모양 링크. 활성 상태는 배경색으로 구분한다.
 */

import Link from 'next/link';

interface FilterChipProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

export default function FilterChip({ href, active, children }: FilterChipProps) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {children}
    </Link>
  );
}
