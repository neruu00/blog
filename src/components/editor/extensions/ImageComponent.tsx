/**
 * @file ImageComponent.tsx
 * @description 에디터의 이미지 노드뷰. 업로드 중이거나 이미지를 불러오는 동안 스켈레톤을 보여준다.
 */

'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useState, useEffect } from 'react';

import Skeleton from '@/components/ui/Skeleton';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export default function ImageComponent({ node }: NodeViewProps) {
  const { src, alt, uploading } = node.attrs;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 소스가 바뀌거나 업로드가 시작되면 로딩 상태를 다시 잡는다
    setIsLoaded(false);

    if (!uploading && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      if (img.complete) {
        setIsLoaded(true);
      }
    }
  }, [src, uploading]);

  return (
    <NodeViewWrapper className="relative my-4 flex justify-center">
      <div className="relative w-full overflow-hidden rounded-lg border border-gray-100">
        {(uploading || !isLoaded) && (
          <div className="flex h-[300px] w-full items-center justify-center bg-gray-50">
            <Skeleton className="h-full w-full" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner label="이미지 업로드 중" />
                  <span className="text-sm font-medium text-gray-500">이미지 업로드 중...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 업로드한 이미지의 원본 비율과 크기를 그대로 따라야 한다. next/image는 width/height나
            크기가 정해진 부모(fill)를 요구하므로 쓸 수 없다. */}
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || ''}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              'h-auto w-full transition-opacity duration-500',
              !isLoaded || uploading ? 'h-0 opacity-0' : 'opacity-100',
            )}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
