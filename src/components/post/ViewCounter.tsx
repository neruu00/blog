'use client';

import { useEffect, useRef } from 'react';

import { incrementViewCount } from '@/actions/post';

interface ViewCounterProps {
  postId: string;
}

/** 마운트할 때 조회수를 올린다. 쿠키를 사용해 같은 글은 24시간 안에 다시 세지 않는다. */
export default function ViewCounter({ postId }: ViewCounterProps) {
  const isFetched = useRef(false);

  useEffect(() => {
    // Strict Mode에서 effect가 두 번 실행돼도 한 번만 세도록 ref로 막는다
    if (isFetched.current) return;
    isFetched.current = true;

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

    if (viewedPosts.includes(postId)) return;

    incrementViewCount(postId);

    viewedPosts.push(postId);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(viewedPosts))}; expires=${expires}; path=/`;
  }, [postId]);

  return null;
}
