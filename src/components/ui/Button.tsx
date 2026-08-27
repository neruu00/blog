/**
 * @file Button.tsx
 * @description 전역 공용 버튼. variant/size로 스타일을 통일한다.
 *              href를 주면 next/link로, 없으면 <button>으로 렌더링한다.
 *              토글(에디터 툴바 등)은 aria-pressed를 주면 ghost가 활성 스타일을 입는다.
 */

import Link from 'next/link';

import { cn } from '@/lib/utils';

import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'icon';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300',
  outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50',
  ghost:
    'text-gray-500 hover:bg-gray-100 hover:text-gray-900 aria-pressed:bg-orange-100 aria-pressed:text-orange-600 disabled:opacity-50',
  destructive: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9',
};

function buttonClass(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors',
    SIZE_CLASSES[size],
    VARIANT_CLASSES[variant],
    className,
  );
}

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

type ButtonProps =
  | (BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
  | (BaseProps & ComponentPropsWithoutRef<typeof Link> & { href: string });

export default function Button(props: ButtonProps) {
  // 구조분해 전에 좁혀야 href 유무로 타입이 갈린다
  if (props.href !== undefined) {
    const { variant = 'primary', size = 'md', className, ...rest } = props;
    return <Link {...rest} className={buttonClass(variant, size, className)} />;
  }

  const { variant = 'primary', size = 'md', className, type = 'button', ...rest } = props;
  return <button {...rest} type={type} className={buttonClass(variant, size, className)} />;
}
