/**
 * @file ProjectThumbnail.tsx
 * @description 프로젝트 카드의 대표 캡처. 로드되기 전까지 뒤에 깔린 스피너를 보여준다.
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';

import Spinner from '@/components/ui/Spinner';
import type { Media } from '@/lib/constants/portfolio';

interface ProjectThumbnailProps {
  media: Media;
}

export default function ProjectThumbnail({ media }: ProjectThumbnailProps) {
  const [ready, setReady] = useState(false);
  // 로드에 실패해도 걷어야 스피너가 계속 돌지 않는다
  const done = () => setReady(true);

  return (
    <div className="relative aspect-3/2 overflow-hidden bg-gray-100">
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" label={`${media.alt} 불러오는 중`} />
        </div>
      )}
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        onLoad={done}
        onError={done}
        className="object-cover object-top"
      />
    </div>
  );
}
