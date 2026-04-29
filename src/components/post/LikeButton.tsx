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

  const handleToggle = () => {
    if (!session) {
      addToast('로그인이 필요한 기능입니다.', 'error');
      return;
    }

    const newHasLiked = !uiState.hasLiked;
    const newCount = uiState.count + (newHasLiked ? 1 : -1);

    // 1. 응답에 상관없이 무조건 UI를 즉시 선반영
    setUiState({
      count: newCount,
      hasLiked: newHasLiked,
    });

    // 2. 디바운싱: 이전 타이머가 있다면 취소 (연타 시 통신을 보류함)
    if (timerRef.current) clearTimeout(timerRef.current);

    // 새로운 타이머 시작 (클릭이 멈추고 500ms 후에 단 한 번만 서버 통신 진행)
    timerRef.current = setTimeout(async () => {
      // 만약 500ms 안에 따닥! 눌러서 원래 상태로 돌아왔다면,
      // 현재 uiState.hasLiked 와 서버 syncState.hasLiked 가 같아지므로 통신 낭비를 막음
      if (syncState.current.hasLiked === newHasLiked) return;

      try {
        // 서버 통신 진행
        const result = await toggleLike(postId, newHasLiked);

        if (!result.success) {
          throw new Error(result.error || '좋아요 처리에 실패했습니다.');
        }

        // 통신 성공 시 기준 상태(진실의 원천)를 최신화
        syncState.current = {
          count: newCount,
          hasLiked: newHasLiked,
        };

        // GA 커스텀 이벤트 전송
        trackLikeToggle(postId, newHasLiked);
      } catch (error: any) {
        // 실패 시: 사용자의 화면(uiState)을 기존의 성공했던 기준 상태(syncState)로 롤백
        setUiState({
          count: syncState.current.count,
          hasLiked: syncState.current.hasLiked,
        });
        addToast(error.message, 'error');
      }
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
