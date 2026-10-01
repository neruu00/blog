/**
 * @file ProjectThumbnail.tsx
 * @description 프로젝트 대표 캡처. 목록 카드와 상세 소개가 함께 쓰며, 로드되기 전까지 뒤에 깔린 스피너를 보여준다.
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

import Spinner from '@/components/ui/Spinner';
import type { Media } from '@/lib/constants/portfolio';

interface ProjectThumbnailProps {
  media: Media;
  /** next/image sizes. 기본값은 목록 카드의 2열 기준이다 */
  sizes?: string;
}

export default function ProjectThumbnail({
  media,
  sizes = '(min-width: 640px) 50vw, 100vw',
}: ProjectThumbnailProps) {
  const [ready, setReady] = useState(false);
  // 로드에 실패해도 걷어야 스피너가 계속 돌지 않는다
  const done = () => setReady(true);

  return (
    <div className="relative aspect-3/2 overflow-hidden bg-gray-800">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" label={`${media.alt} 불러오는 중`} />
        </div>
      )}
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes={sizes}
        onLoad={done}
        onError={done}
        className="object-cover object-top transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
      />
    </div>
  );
}
