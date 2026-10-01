/**
 * @file ImageFigure.tsx
 * @description 포트폴리오 과제의 이미지와 캡션. media가 없으면 채워야 할 캡처를 설명하는 이미지 자리로 보여준다.
 */

import Image from 'next/image';

import EmptyState from '@/components/common/EmptyState';
import type { ImageVisual } from '@/lib/constants/portfolio';

interface ImageFigureProps {
  visual: ImageVisual;
}

export default function ImageFigure({ visual }: ImageFigureProps) {
  const { id, description, caption, media } = visual;

  if (!media) {
    return (
      <EmptyState message={`이미지 자리: ${id}`}>
        <p className="max-w-md px-4 text-sm text-gray-400">{description}</p>
      </EmptyState>
    );
  }

  return (
    <figure>
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 1024px) 768px, 100vw"
        className="h-auto w-full rounded-xl border border-gray-100"
      />
      {caption && (
        <figcaption className="mt-3 text-sm leading-relaxed text-gray-500">{caption}</figcaption>
      )}
    </figure>
  );
}
