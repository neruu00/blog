/**
 * @file PostSearch.tsx
 * @description 게시글 검색 버튼과 검색 창. 데스크톱(lg 이상)에서는 화면 위쪽에 뜨는 Spotlight형 창으로,
 *              그보다 좁은 화면에서는 아래에서 올라오는 드로어로 연다. 입력하는 동안 미리 보기 결과를 보여주고,
 *              Enter로 선택한 글이나 `/posts?q=` 전체 결과로 이동한다. ⌘K / Ctrl+K로도 열 수 있다.
 */

'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from 'react';

import { searchPosts } from '@/actions/search';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import TagBadge from '@/components/ui/TagBadge';
import { cn } from '@/lib/utils';
import { formatDateKo } from '@/lib/utils/date';
import type { PostSearchResult } from '@/types/search.type';

/** 입력이 멈춘 뒤 검색 요청을 보내기까지 기다리는 시간(ms) */
const DEBOUNCE_MS = 200;

/**
 * 열림·닫힘 전환은 `@starting-style`(starting:)과 `transition-discrete`로 CSS만으로 처리한다.
 * display·overlay까지 전환해야 닫힐 때 최상위 레이어에서 바로 빠지지 않고 애니메이션이 끝까지 보인다.
 */
const DIALOG_CLASS = cn(
  'fixed m-0 hidden h-auto max-h-none w-full max-w-none flex-col overflow-hidden border-0 bg-white p-0 text-gray-900 outline-none open:flex',
  'inset-x-0 top-header bottom-0 rounded-t-2xl',
  'lg:top-1/5 lg:bottom-auto lg:mx-auto lg:max-h-3/5 lg:max-w-xl lg:rounded-2xl lg:shadow-2xl',
  'transition-[translate,scale,opacity,display,overlay] transition-discrete duration-300 ease-out motion-reduce:transition-none lg:duration-200',
  'translate-y-full open:translate-y-0 starting:open:translate-y-full',
  'lg:translate-y-0 lg:scale-95 lg:opacity-0 lg:open:scale-100 lg:open:opacity-100 lg:starting:open:translate-y-0 lg:starting:open:scale-95 lg:starting:open:opacity-0',
  'backdrop:bg-black/30 backdrop:opacity-0 backdrop:backdrop-blur-sm backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-300 open:backdrop:opacity-100 starting:open:backdrop:opacity-0',
);

/**
 * 뒤쪽 페이지 스크롤을 막는다. 스크롤바가 사라진 폭만큼 오른쪽 여백을 채워야
 * 본문 폭이 넓어지면서 목록이 옆으로 밀리지 않는다.
 */
function lockPageScroll() {
  const root = document.documentElement;
  const scrollbarWidth = window.innerWidth - root.clientWidth;
  root.style.overflow = 'hidden';
  if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
}

function unlockPageScroll() {
  const root = document.documentElement;
  root.style.overflow = '';
  root.style.paddingRight = '';
}

/** macOS 여부. 서버 렌더링 때는 알 수 없으므로 null을 돌려주고 단축키 표기를 숨긴다 */
function useIsMac() {
  return useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => null,
  );
}

/** 제목에서 검색어와 맞는 첫 부분을 강조한다 */
function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const index = query ? title.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index === -1) return <>{title}</>;

  return (
    <>
      {title.slice(0, index)}
      <mark className="bg-transparent text-orange-700">
        {title.slice(index, index + query.length)}
      </mark>
      {title.slice(index + query.length)}
    </>
  );
}

interface PostSearchProps {
  /** `/posts?q=` 결과 화면에서 열 때 입력창에 채워 둘 검색어 */
  initialQuery?: string;
}

export default function PostSearch({ initialQuery = '' }: PostSearchProps) {
  const router = useRouter();
  const isMac = useIsMac();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 응답 순서가 뒤바뀌어도 마지막 요청의 결과만 반영하기 위한 번호 */
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState(initialQuery);
  /** 마지막으로 응답을 받은 검색어와 결과. 아직 응답이 없으면 null */
  const [result, setResult] = useState<{ query: string; items: PostSearchResult[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const trimmed = query.trim();
  const items = result && result.query === trimmed ? result.items : [];
  const hasAnswer = result !== null && result.query === trimmed;
  /** 결과 목록 뒤에 "전체 결과 보기"가 마지막 선택지로 붙는다 */
  const optionCount = trimmed ? items.length + 1 : 0;

  const runSearch = (value: string) => {
    const requestId = ++requestIdRef.current;
    if (!value) {
      setResult(null);
      setError(null);
      return;
    }
    startTransition(async () => {
      const response = await searchPosts(value);
      if (requestId !== requestIdRef.current) return;
      if (response.success) {
        setResult({ query: value, items: response.data ?? [] });
        setError(null);
      } else {
        setError(response.error);
      }
    });
  };

  const open = () => {
    const dialog = dialogRef.current;
    // StrictMode 등으로 이미 열린 다이얼로그에 showModal()을 다시 부르면 예외가 나므로 먼저 확인한다
    if (!dialog || dialog.open) return;
    dialog.showModal();
    lockPageScroll();
    inputRef.current?.focus();
    inputRef.current?.select();
    if (trimmed && !hasAnswer) runSearch(trimmed);
  };

  const close = () => dialogRef.current?.close();

  const navigate = (href: string) => {
    close();
    router.push(href);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      unlockPageScroll();
    },
    [],
  );

  const handleChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value.trim()), DEBOUNCE_MS);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter·방향키는 글자 확정에 쓰이므로 건드리지 않는다
    if (event.nativeEvent.isComposing || optionCount === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % optionCount);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + optionCount) % optionCount);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[activeIndex];
      navigate(item ? `/posts/${item.id}` : `/posts?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const optionId = (index: number) => `post-search-option-${index}`;

  return (
    <>
      <Button variant="outline" size="sm" onClick={open} aria-haspopup="dialog">
        <Search aria-hidden="true" className="size-4" />
        검색
        {isMac !== null && (
          <kbd className="ml-1 hidden rounded bg-gray-100 px-1.5 py-0.5 font-sans text-xs text-gray-500 lg:inline">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        )}
      </Button>

      <dialog
        ref={dialogRef}
        aria-label="게시글 검색"
        className={DIALOG_CLASS}
        onClose={unlockPageScroll}
        onClick={(event) => {
          // 내용은 모두 안쪽 div가 덮으므로, 이벤트 대상이 dialog 자신이면 바깥 배경(::backdrop)을 누른 것이다
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            aria-hidden="true"
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray-200 lg:hidden"
          />

          <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-3 lg:px-5 lg:py-4">
            <Search aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={optionCount > 0}
              aria-controls="post-search-listbox"
              aria-autocomplete="list"
              aria-activedescendant={optionCount > 0 ? optionId(activeIndex) : undefined}
              aria-label="검색어"
              placeholder="제목이나 태그로 검색"
              maxLength={50}
              value={query}
              onChange={(event) => handleChange(event.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 bg-transparent text-lg text-gray-900 outline-none placeholder:text-gray-400"
            />
            {isPending && <Spinner size="sm" label="검색 중" className="shrink-0" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={close}
              className="-mr-2 shrink-0 px-2 lg:hidden"
            >
              닫기
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {!trimmed && (
              <p className="px-3 py-8 text-center text-sm text-gray-500">
                글 제목이나 태그로 찾을 수 있습니다.
                <br />
                예: 리액트, 이벤트 루프, jwt
              </p>
            )}

            {trimmed && error && (
              <p className="px-3 py-8 text-center text-sm text-gray-500">{error}</p>
            )}

            {trimmed && !error && hasAnswer && items.length === 0 && (
              <p className="px-3 pt-6 pb-2 text-center text-sm text-gray-500">
                ‘{trimmed}’와 맞는 글이 없습니다.
              </p>
            )}

            {trimmed && !error && (
              <ul id="post-search-listbox" role="listbox" aria-label="검색 결과">
                {items.map((item, index) => (
                  <li
                    key={item.id}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => navigate(`/posts/${item.id}`)}
                    className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2.5 transition-colors aria-selected:bg-orange-50"
                  >
                    <span className="font-medium text-gray-900">
                      <HighlightedTitle title={item.title} query={trimmed} />
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      {item.seriesTitle && <TagBadge tag={item.seriesTitle} hash={false} />}
                      <time dateTime={item.createdAt}>{formatDateKo(item.createdAt)}</time>
                      {item.tags.length > 0 && (
                        <span>{item.tags.map((tag) => `#${tag}`).join(' ')}</span>
                      )}
                    </span>
                  </li>
                ))}
                <li
                  id={optionId(items.length)}
                  role="option"
                  aria-selected={activeIndex === items.length}
                  onMouseMove={() => setActiveIndex(items.length)}
                  onClick={() => navigate(`/posts?q=${encodeURIComponent(trimmed)}`)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition-colors aria-selected:bg-orange-50 aria-selected:text-gray-900"
                >
                  <Search aria-hidden="true" className="size-4 shrink-0" />‘{trimmed}’ 전체 결과
                  보기
                </li>
              </ul>
            )}
          </div>

          <div className="hidden shrink-0 items-center gap-4 border-t border-gray-100 px-5 py-2.5 text-xs text-gray-400 lg:flex">
            <span>↑↓ 이동</span>
            <span>Enter 열기</span>
            <span>Esc 닫기</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
