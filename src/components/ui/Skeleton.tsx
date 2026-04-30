/**
 * @file Skeleton.tsx
 * @description 로딩 상태를 표시하기 위한 스켈레톤 UI 컴포넌트.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-neutral-800', className)} />
  );
}
