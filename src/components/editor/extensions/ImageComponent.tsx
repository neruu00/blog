/**
 * @file ImageComponent.tsx
 * @description Tiptap 에디터 내에서 이미지를 렌더링하는 React 컴포넌트.
 *              로딩 중이거나 업로드 중일 때 스켈레톤 UI를 표시합니다.
 */

'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useState, useEffect } from 'react';

import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export default function ImageComponent({ node }: NodeViewProps) {
  const { src, alt, uploading } = node.attrs;
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 소스가 바뀌거나 업로드가 시작되면 로딩 상태 초기화
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
      <div className="relative w-full overflow-hidden rounded-lg border border-gray-100 dark:border-neutral-800">
        {/* 스켈레톤: 업로드 중이거나 아직 이미지가 로드되지 않았을 때 표시 */}
        {(uploading || !isLoaded) && (
          <div className="flex h-[300px] w-full items-center justify-center bg-gray-50 dark:bg-neutral-900">
            <Skeleton className="h-full w-full" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  <span className="text-sm font-medium text-gray-500 dark:text-neutral-400">
                    이미지 업로드 중...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 실제 이미지: 업로드 중이 아닐 때만 렌더링 (또는 투명하게 미리 렌더링하여 로드 체크) */}
        {src && (
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
