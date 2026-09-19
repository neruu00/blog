/**
 * @file NewsSourceCard.tsx
 * @description 뉴스 원문 링크를 제목과 출처 정보가 있는 북마크 카드로 표시한다.
 */

'use client';

import { ExternalLink, Newspaper } from 'lucide-react';
import { useState } from 'react';

import type { TechNewsSource } from '@/types/tech-news.type';

interface NewsSourceCardProps {
  newsId: string;
  source: TechNewsSource;
  url: string;
  title: string;
  description: string;
  sourceLabel: string;
}

export default function NewsSourceCard({
  newsId,
  source,
  url,
  title,
  description,
  sourceLabel,
}: NewsSourceCardProps) {
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex min-h-36 overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-orange-300"
    >
      <div className="relative z-10 w-[72%] min-w-0 p-5 sm:w-[65%]">
        <p className="line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-orange-600">
          {title}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">{description}</p>
        <span className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          {hostname}
        </span>
      </div>

      <div className="absolute inset-y-0 right-0 flex w-[45%] items-center justify-end overflow-hidden">
        {imageFailed ? (
          source === 'javascript' ? (
            <div className="bg-javascript flex aspect-square h-full max-w-full items-end justify-end p-3">
              <span className="text-4xl font-bold tracking-tighter text-gray-900">JS</span>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-orange-50 px-3 text-center">
              <Newspaper className="h-6 w-6 text-orange-600" aria-hidden="true" />
              <span className="text-xs font-medium text-orange-700">{sourceLabel}</span>
            </div>
          )
        ) : (
          // 원문마다 호스트가 달라 next/image allowlist를 유지할 수 없어 브라우저 이미지로 표시한다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/news/${newsId}/image`}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain object-right"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
    </a>
  );
}
