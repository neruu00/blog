/**
 * @file EmptyState.tsx
 * @description 목록이 비었을 때 표시하는 공용 플레이스홀더 박스.
 *              점선 테두리 + 중앙 정렬 안내 문구. 보조 문구/액션은 children으로.
 */

interface EmptyStateProps {
  message: string;
  /** 보조 문구나 액션 링크 (예: 관리자용 "새 글 작성하기") */
  children?: React.ReactNode;
}

export default function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 py-16 text-center">
      <p className="text-gray-400">{message}</p>
      {children}
    </div>
  );
}
