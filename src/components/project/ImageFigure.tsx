/**
 * @file ImageFigure.tsx
 * @description 포트폴리오 과제의 이미지와 캡션. 이미지는 들어간 테두리 액자 안에 넣는다.
 *              media가 없으면 채워야 할 캡처를 설명하는 이미지 자리로 보여준다.
 */

import Image from 'next/image';

import { FileIcon } from '@/components/project/Win95Icons';
import type { ImageVisual } from '@/lib/constants/portfolio';

interface ImageFigureProps {
  visual: ImageVisual;
}

export default function ImageFigure({ visual }: ImageFigureProps) {
  const { id, description, caption, media } = visual;

  if (!media) {
    return (
      <div className="win-sunken bg-win-face flex flex-col items-center gap-2 px-4 py-8 text-center">
        <FileIcon />
        <p className="font-bold">이미지 자리: {id}</p>
        <p className="max-w-md text-gray-500">{description}</p>
      </div>
    );
  }

  return (
    <figure>
      <div className="win-sunken bg-win-face p-[2px]">
        <Image
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes="(min-width: 1024px) 768px, 100vw"
          className="block h-auto w-full"
        />
      </div>
      {caption && <figcaption className="mt-2 text-gray-500">{caption}</figcaption>}
    </figure>
  );
}
