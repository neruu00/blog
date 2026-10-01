/**
 * @file Win95Button.tsx
 * @description /portfolio의 Windows 95 화면 전용 버튼. 이 화면 밖에서는 ui/Button을 쓴다.
 *              href를 주면 next/link로, 없으면 <button>으로 렌더링한다. 누르는 동안 들어간 테두리로 바뀐다.
 */

import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from 'react';

type Win95ButtonSize = 'md' | 'icon';

const SIZE_CLASSES: Record<Win95ButtonSize, string> = {
  md: 'h-7 px-3',
  /** 제목줄의 닫기 버튼 크기 */
  icon: 'h-4 w-[18px]',
};

function win95ButtonClass(size: Win95ButtonSize, className?: string) {
  return cn(
    'win-raised active:win-pressed inline-flex shrink-0 items-center justify-center gap-1.5 font-win text-xs text-black',
    SIZE_CLASSES[size],
    className,
  );
}

interface BaseProps {
  size?: Win95ButtonSize;
}

type Win95ButtonProps =
  | (BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (BaseProps & ComponentPropsWithoutRef<typeof Link> & { href: string });

export default function Win95Button(props: Win95ButtonProps) {
  if (props.href !== undefined) {
    const { size = 'md', className, ...rest } = props;
    return <Link {...rest} className={win95ButtonClass(size, className)} />;
  }

  const { size = 'md', className, type = 'button', ...rest } = props;
  return <button {...rest} type={type} className={win95ButtonClass(size, className)} />;
}
