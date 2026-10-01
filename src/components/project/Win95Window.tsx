/**
 * @file Win95Window.tsx
 * @description /portfolio 바탕화면에 여는 Windows 95 창. 제목줄·(폴더면) 도구 모음과 주소창·본문·상태 표시줄로 구성된다.
 *              닫기 버튼은 창을 연 곳으로 돌아간다. 바탕화면에서 연 창은 바탕화면으로, 폴더에서 연 문서는 그 폴더로 간다.
 */

import { ArrowUp, X } from 'lucide-react';

import Win95Button from '@/components/project/Win95Button';
import { FolderIcon } from '@/components/project/Win95Icons';

interface Win95WindowProps {
  title: string;
  /** 제목줄 왼쪽의 16px 아이콘. 기본은 폴더다 */
  icon?: React.ReactNode;
  /** 주소창에 표시하는 경로. 폴더·문서 창에만 주고, 앱 창에는 주소창을 그리지 않는다 */
  address?: string;
  closeHref: string;
  closeLabel: string;
  /** 도구 모음의 "위로" 버튼이 갈 경로. 없으면 버튼을 그리지 않는다 */
  upHref?: string;
  /** 상태 표시줄 내용. 없으면 상태 표시줄을 그리지 않는다 */
  status?: React.ReactNode;
  children: React.ReactNode;
}

export default function Win95Window({
  title,
  icon = <FolderIcon size={16} />,
  address,
  closeHref,
  closeLabel,
  upHref,
  status,
  children,
}: Win95WindowProps) {
  return (
    <section
      aria-label={title}
      className="win-raised font-win flex max-h-full flex-col gap-0.5 p-[3px] text-xs text-black"
    >
      <div className="win-titlebar flex h-[22px] items-center gap-1.5 pr-[3px] pl-1 font-bold text-white">
        {icon}
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <Win95Button
          size="icon"
          href={closeHref}
          aria-label={closeLabel}
          title={closeLabel}
          className="ml-0.5"
        >
          <X className="h-3 w-3" strokeWidth={3} />
        </Win95Button>
      </div>

      {(address || upHref) && (
        <div className="border-win-shadow flex items-center gap-1.5 border-t px-1 py-1 shadow-[inset_0_1px_var(--color-white)]">
          {upHref && (
            <>
              <Win95Button href={upHref}>
                <ArrowUp className="h-3.5 w-3.5" />
                위로
              </Win95Button>
              <span
                aria-hidden
                className="border-l-win-shadow mx-1 h-6 border-r border-l border-r-white"
              />
            </>
          )}
          {address && (
            <>
              <span className="shrink-0">주소</span>
              <div className="win-sunken flex h-[22px] min-w-0 flex-1 items-center gap-1.5 bg-white px-1.5">
                <FolderIcon size={16} />
                <span className="truncate">{address}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 창 높이는 바탕화면 안으로 제한되므로 넘치는 내용은 본문 안에서 스크롤한다 */}
      <div className="win-sunken win-scrollbar min-h-0 flex-1 overflow-y-auto bg-white p-[2px]">
        {children}
      </div>

      {status && <div className="win-sunken flex h-5 items-center px-1.5">{status}</div>}
    </section>
  );
}
