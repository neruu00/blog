/**
 * @file Win95IconLink.tsx
 * @description 아이콘 아래에 이름표를 단 Windows 95식 아이콘 링크. 바탕화면 아이콘과 폴더 안 앱 아이콘이 함께 쓴다.
 *              한 번 클릭하면 연다. 웹에서는 더블클릭을 알아채기 어렵고 터치에서는 쓸 수 없기 때문이다.
 */

import Link from 'next/link';

import type { ComponentPropsWithoutRef } from 'react';

interface Win95IconLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  icon: React.ReactNode;
  label: string;
}

export default function Win95IconLink({
  icon,
  label,
  className = '',
  ...rest
}: Win95IconLinkProps) {
  return (
    <Link
      {...rest}
      className={`group font-win flex w-24 flex-col items-center gap-1.5 p-1.5 text-center text-xs text-black ${className}`}
    >
      {icon}
      <span className="group-hover:bg-win-title group-focus-visible:bg-win-title px-1 leading-snug break-keep group-hover:text-white group-focus-visible:text-white">
        {label}
      </span>
    </Link>
  );
}
