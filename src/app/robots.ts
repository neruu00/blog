/**
 * @file robots.ts
 * @description 크롤러 규칙. 관리자 전용 경로와 크론 API는 색인에서 제외한다.
 */

import { SITE_URL } from '@/lib/constants/site';

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/write', '/edit/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
