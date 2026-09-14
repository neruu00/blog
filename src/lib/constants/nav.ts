/**
 * @file nav.ts
 * @description 사이드바 및 모바일 헤더 네비게이션 상수
 */

import { FileText, Home, Newspaper, User } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/about', label: 'About', icon: User },
] as const;
