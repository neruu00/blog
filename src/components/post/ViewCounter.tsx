'use client';

import { useEffect, useRef } from 'react';

import { incrementViewCount } from '@/actions/post';

interface ViewCounterProps {
  postId: string;
}

/**
 * 조회수 카운터 컴포넌트.
 * 쿠키 기반으로 24시간 내 동일 게시글 재카운트를 방지한다.
 */
export default function ViewCounter({ postId }: ViewCounterProps) {
  const isFetched = useRef(false);

  useEffect(() => {
    // Strict Mode에서 두 번 호출되는 것을 방지하기 위해 useRef 사용
    if (isFetched.current) return;
    isFetched.current = true;

    // 쿠키에서 이미 조회한 게시글 목록 확인
    const cookieName = 'viewed_posts';
    const cookies = document.cookie.split('; ').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );

    let viewedPosts: string[] = [];
    try {
      viewedPosts = cookies[cookieName] ? JSON.parse(decodeURIComponent(cookies[cookieName])) : [];
    } catch {
      viewedPosts = [];
    }

    // 이미 조회한 게시글이면 카운트하지 않음
    if (viewedPosts.includes(postId)) return;

    // 조회수 증가 API 호출
    incrementViewCount(postId);

    // 쿠키에 현재 게시글 ID 추가 (24시간 유효)
    viewedPosts.push(postId);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(viewedPosts))}; expires=${expires}; path=/`;
  }, [postId]);

  return null;
}
