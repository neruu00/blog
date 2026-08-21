/**
 * @file Skeleton.tsx
 * @description 로딩 상태를 표시하기 위한 스켈레톤 UI 컴포넌트.
 *              사이트의 모든 스켈레톤 색·애니메이션의 단일 출처.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  /** 런타임 계산값(동적 너비 등) 전용 — 정적 스타일은 className으로 */
  style?: React.CSSProperties;
}

export default function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-gray-100', className)} style={style} />;
}
