/**
 * @file sitemap.ts
 * @description 검색엔진용 사이트맵. 정적 경로 + 게시글 + 기술 뉴스를 포함한다.
 *              관리자 전용 경로(/write, /edit)는 제외한다.
 */

import { SITE_URL } from '@/lib/constants/site';
import { supabase } from '@/lib/supabase';

import type { MetadataRoute } from 'next';

/**
 * 1시간마다 재생성. 이 설정이 없으면 빌드 시점에 고정되어
 * 새 글이 재배포 전까지 사이트맵에 나타나지 않는다.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/posts`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/news`, changeFrequency: 'daily', priority: 0.7 },
  ];

  const [{ data: posts }, { data: news }] = await Promise.all([
    supabase.from('posts').select('id, created_at, updated_at'),
    supabase.from('tech_news').select('id, published_at'),
  ]);

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${SITE_URL}/posts/${post.id}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const newsRoutes: MetadataRoute.Sitemap = (news ?? []).map((item) => ({
    url: `${SITE_URL}/news/${item.id}`,
    lastModified: new Date(item.published_at),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...newsRoutes];
}
