/**
 * @file Spinner.tsx
 * @description 회전형 로딩 인디케이터. 사이트의 모든 스피너 색·굵기·속도의 단일 출처.
 *
 *              Skeleton과 쓰임이 다르다:
 *              - Skeleton — 들어올 내용의 '모양'을 미리 보여줄 수 있을 때 (목록, 카드, 문단)
 *              - Spinner  — 모양을 알 수 없거나 이미 자리는 잡혔고 '기다림'만 알리면 될 때
 *                           (이미지·영상 로드, 업로드, 아이콘 버튼 제출)
 */

import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md';

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
};

interface SpinnerProps {
  size?: SpinnerSize;
  /** 스크린리더가 읽을 문구. 무엇을 기다리는지 밝힐 수 있으면 밝힌다 */
  label?: string;
  className?: string;
}

export default function Spinner({ size = 'md', label = '불러오는 중', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'animate-spin rounded-full border-orange-500 border-t-transparent',
        SIZE_CLASSES[size],
        className,
      )}
    />
  );
}
