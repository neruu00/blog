'use client';

import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

import { toggleLike } from '@/actions/like';
import { trackLikeToggle } from '@/lib/utils/analytics';
import { useToastStore } from '@/stores/useToastStore';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialHasLiked: boolean;
}

export default function LikeButton({ postId, initialLikeCount, initialHasLiked }: LikeButtonProps) {
  const { data: session } = useSession();
  const addToast = useToastStore((state) => state.addToast);

  // 서버에 실제로 동기화되어 있다고 확신하는 "기준 상태 (진실의 원천)"
  const syncState = useRef({
    count: initialLikeCount,
    hasLiked: initialHasLiked,
  });

  // 사용자 화면에 즉시 보여줄 "낙관적 상태"
  const [uiState, setUiState] = useState({
    count: initialLikeCount,
    hasLiked: initialHasLiked,
  });

  // 디바운스를 위한 타이머 참조
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 시리얼 동기화를 위한 상태 관리
  const latestDesiredHasLiked = useRef(initialHasLiked);
  const isSyncing = useRef(false);

  const syncWithServer = async () => {
    // 1. 이미 통신 중이면 중복 실행 방지
    if (isSyncing.current) return;

    // 2. 현재 서버 상태(syncState)와 사용자의 최종 의도(latestDesiredHasLiked)가 같으면 종료
    if (syncState.current.hasLiked === latestDesiredHasLiked.current) return;

    isSyncing.current = true;
    const targetHasLiked = latestDesiredHasLiked.current;
    const targetCount = syncState.current.count + (targetHasLiked ? 1 : -1);

    try {
      const result = await toggleLike(postId, targetHasLiked);

      if (!result.success) {
        throw new Error(result.error || '좋아요 처리에 실패했습니다.');
      }

      // 통신 성공 시 기준 상태 최신화
      syncState.current = {
        count: targetCount,
        hasLiked: targetHasLiked,
      };

      trackLikeToggle(postId, targetHasLiked);
    } catch (error: any) {
      // 실패 시: UI를 마지막으로 성공했던 서버 상태로 롤백
      // (단, 사용자가 그 사이에 또 클릭했을 수 있으므로 최신 의도를 덮어쓰진 않음)
      setUiState({
        count: syncState.current.count,
        hasLiked: syncState.current.hasLiked,
      });
      latestDesiredHasLiked.current = syncState.current.hasLiked;
      addToast(error.message, 'error');
    } finally {
      isSyncing.current = false;
      // 대기 중에 변경된 사항이 있는지 확인하기 위해 재귀 호출
      syncWithServer();
    }
  };

  const handleToggle = () => {
    if (!session) {
      addToast('로그인이 필요한 기능입니다.', 'error');
      return;
    }

    const newHasLiked = !uiState.hasLiked;
    const newCount = uiState.count + (newHasLiked ? 1 : -1);

    // 1. UI 즉시 반영
    setUiState({
      count: newCount,
      hasLiked: newHasLiked,
    });

    // 2. 최종 의도 업데이트
    latestDesiredHasLiked.current = newHasLiked;

    // 3. 디바운싱
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      syncWithServer();
    }, 500);
  };

  // 컴포넌트가 사라질 때 메모리 누수 방지 (타이머 정리)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        uiState.hasLiked
          ? 'border-orange-200 bg-orange-50 text-orange-600'
          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-transform ${
          uiState.hasLiked ? 'scale-110 fill-orange-500 text-orange-500' : ''
        }`}
      />
      좋아요 {uiState.count > 0 && <span>{uiState.count}</span>}
    </button>
  );
}
