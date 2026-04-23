'use client';

import { useEffect, useRef } from 'react';

import { incrementViewCount } from '@/actions/post';

interface ViewCounterProps {
  postId: string;
}

export default function ViewCounter({ postId }: ViewCounterProps) {
  const isFetched = useRef(false);

  useEffect(() => {
    // Strict Mode에서 두 번 호출되는 것을 방지하기 위해 useRef 사용
    if (isFetched.current) return;
    isFetched.current = true;

    incrementViewCount(postId);
  }, [postId]);

  return null;
}
