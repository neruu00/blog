/**
 * @file nav.ts
 * @description 사이드 네비와 모바일 헤더가 함께 쓰는 메뉴 항목.
 */

import { FileText, FolderKanban, Home, Newspaper } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/portfolio', label: 'Portfolio', icon: FolderKanban },
] as const;
