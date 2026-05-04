# 블로그 리팩토링 계획

## 목표
1. **Props Drilling 제거**: Zustand 스토어 확장으로 상태를 전역화
2. **Client Component 최소화**: 불필요한 `'use client'`를 제거하고 Server Component를 최대화
3. **관심사 분리**: 비대한 컴포넌트를 역할별로 분리 (데이터 / UI / 행동)
4. **컴포넌트 재사용성 강화**: 공통 UI 프리미티브 도입으로 코드 중복 제거
5. **FCP / LCP 개선**: 스트리밍, 코드 스플리팅, 이미지 최적화

---

## 현황 분석

### 문제점 목록

#### 1. Client Component 과용
| 컴포넌트 | 현황 | 문제 |
|---|---|---|
| `SideNav.tsx` | `'use client'` 전체 | `usePathname`, `useSession`만 필요 → 분리 가능 |
| `MobileHeader.tsx` | `'use client'` 전체 | 사이드바 open 토글 + 로그인 상태만 필요 |
| `CommentSection.tsx` | `'use client'` 전체 (192줄) | 댓글 폼 / 댓글 목록 / 삭제 로직이 혼재 |
| `PostEditor.tsx` | `'use client'` 전체 (272줄) | 에디터 제어 + 임시저장 + 제출 + 삭제 로직 혼재 |
| `DeletePostButton.tsx` | `'use client'` (루트 `/components`) | `post/` 도메인인데 최상위에 위치 |

#### 2. Props Drilling
| 위치 | Props 흐름 | 문제 |
|---|---|---|
| `posts/[id]/page.tsx` | `initialLikeCount`, `initialHasLiked` → `LikeButton` | 유사한 상태를 Store로 관리 가능 |
| `posts/[id]/page.tsx` | `initialComments` → `CommentSection` | `as any` 캐스트 존재 |
| `PostEditor.tsx` | `isSubmitting`, `onBack`, `onSaveDraft` → `EditorFooter` | 에디터 상태를 Store로 관리하면 props 불필요 |

#### 3. 타입 불안정
| 위치 | 문제 | 해결 방향 |
|---|---|---|
| `CommentSection.tsx` | 로컬 `Comment` 인터페이스 정의 | `types/comment.type.ts`로 이동 |
| `page.tsx` line 150 | `initialComments as any` | Server Action 반환 타입 정의 |
| `SideNav.tsx` line 86 | `session.user as any` | `next-auth.d.ts` 타입 확장 활용 |
| `CommentSection.tsx` line 96 | `@ts-ignore` 사용 | `next-auth.d.ts`의 `isAdmin` 필드 활용 |

#### 4. 파일 위치 규칙 미준수
| 파일 | 현재 위치 | 이상적 위치 |
|---|---|---|
| `DeletePostButton.tsx` | `/components/` | `/components/post/` |
| `TAG_DICTIONARY` 상수 | `posts/page.tsx` 인라인 | `/lib/constants/tags.ts` |

#### 5. FCP / LCP 이슈
- `posts/[id]/page.tsx`에서 `getLikeStatus`, `getComments`를 직렬이 아닌 `Promise.all`로 처리하지만 이 두 데이터 없이도 본문을 먼저 스트리밍할 수 있음
- `TableOfContents`가 DOM 폴링(Polling) 방식으로 헤딩 ID를 부여 → `useEffect` 기반 접근 개선 필요
- `TiptapViewer`가 클라이언트 컴포넌트로 heavy bundle을 포함 → `dynamic import`로 초기 번들에서 분리

---

## 리팩토링 계획 (Phase별)

---

### Phase 1: 타입 안정성 및 파일 구조 정리

> 선행 작업으로 타입을 먼저 확립하여 이후 모든 리팩토링의 기반을 마련한다.

#### [NEW] `src/types/comment.type.ts`
CommentSection 내 로컬로 정의된 `Comment`, `CommentUser` 인터페이스를 전역 타입으로 이동

```ts
export interface CommentUser {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  user?: CommentUser;
}
```

#### [MOVE] `DeletePostButton.tsx`
- `src/components/DeletePostButton.tsx` → `src/components/post/DeletePostButton.tsx`
- 도메인 응집도 향상

#### [NEW] `src/lib/constants/tags.ts`
- `posts/page.tsx`의 `TAG_DICTIONARY`, `POSTS_PER_PAGE` 상수를 분리

#### [FIX] `next-auth.d.ts` 활용
- `SideNav.tsx`의 `session.user as any` → 타입 확장 필드(`isAdmin`) 직접 사용
- `CommentSection.tsx`의 `@ts-ignore` 제거

---

### Phase 2: Zustand 스토어 확장

> 현재 `useModalStore`, `useToastStore`로 잘 구성되어 있으나 에디터와 댓글 상태를 추가로 Store로 관리한다.

#### [NEW] `src/stores/useEditorStore.ts`
PostEditor에서 `EditorFooter`로 Props로 전달되던 상태들을 Store로 이전

```ts
interface EditorState {
  title: string;
  isSubmitting: boolean;
  isDirty: boolean;  // isChanged 대체
  setTitle: (title: string) => void;
  setIsSubmitting: (v: boolean) => void;
  setIsDirty: (v: boolean) => void;
}
```

**효과**: `EditorFooter`에서 `onBack`, `onSaveDraft`, `isSubmitting` props 불필요

#### [MODIFY] `src/stores/useLikeStore.ts`
현재 미사용 상태. `LikeButton`의 낙관적 업데이트 로직을 Store로 이전하여 상태를 명확히 관리

---

### Phase 3: SideNav 분리 (Server + Client)

> `SideNav`를 Server Component shell + Client Component 슬롯으로 분리하여 Client 번들 최소화.

#### [MODIFY] `src/components/layout/SideNav.tsx` → Server Component로 변경
- 정적인 프로필 영역, 푸터, 네비 구조는 Server Component로
- 동적인 active 상태와 인증 버튼은 Client Component로 분리

#### [NEW] `src/components/layout/NavLinks.tsx` (Client)
```tsx
'use client';
// usePathname만 사용하는 Nav 링크 목록
```

#### [NEW] `src/components/layout/AuthButtons.tsx` (Client)
```tsx
'use client';
// useSession, signIn, signOut만 사용하는 버튼 그룹
```

**효과**: SideNav 전체가 `'use client'`에서 벗어나 SSR 렌더링 가능

---

### Phase 4: CommentSection 분리

> 192줄의 단일 Client Component를 역할별로 분리

#### [NEW] `src/components/post/CommentForm.tsx` (Client)
- 댓글 작성 폼 및 제출 로직만 담당

#### [NEW] `src/components/post/CommentList.tsx` (Client)
- 댓글 목록 렌더링 및 삭제 버튼만 담당

#### [MODIFY] `src/components/post/CommentSection.tsx` → Server Component shell
- `CommentForm`, `CommentList`를 조합하는 서버 컴포넌트로 변경
- `initialComments` 데이터를 받아 각 하위 컴포넌트에 전달

---

### Phase 5: PostEditor 분리

> 272줄의 단일 Client Component를 역할별로 분리하고 Store를 활용

#### [NEW] `src/components/editor/PostTitleInput.tsx` (Client)
- 제목 입력 필드만 담당

#### [MODIFY] `src/components/post/PostEditor.tsx`
- 임시저장 로직을 `useDraft` 커스텀 훅으로 추출
- 제출 로직을 `usePostSubmit` 커스텀 훅으로 추출
- `isSubmitting` 등 공유 상태를 `useEditorStore`로 이전

#### [NEW] `src/hooks/useDraft.ts`
```ts
// 임시저장 로드/저장/자동저장/탭닫기방지 로직
export function useDraft(draftKey: string) { ... }
```

#### [NEW] `src/hooks/usePostSubmit.ts`
```ts
// 게시글 제출 및 삭제 로직
export function usePostSubmit(mode, postId, onSubmit) { ... }
```

---

### Phase 6: 공통 UI 프리미티브 도입

> 반복되는 UI 패턴을 추상화하여 재사용 가능한 컴포넌트 생성

#### [NEW] `src/components/ui/DropdownMenu.tsx`
현재 `PostExportButtons`, `Toolbar`에 중복된 드롭다운(오버레이 + 패널) 패턴을 추상화

```tsx
// 사용 예시
<DropdownMenu trigger={<button>내보내기</button>}>
  <DropdownMenu.Item onClick={handleMarkdown}>Markdown</DropdownMenu.Item>
</DropdownMenu>
```

#### [NEW] `src/components/ui/IconButton.tsx`
Toolbar 및 여러 곳에서 반복되는 `p-2 rounded-lg transition-colors` 버튼 패턴 추상화

#### [NEW] `src/components/ui/TagBadge.tsx`
`PostCard`, `posts/[id]/page.tsx` 등 여러 곳에서 반복되는 태그 뱃지 UI 추상화

```tsx
// 현재 중복 코드:
// PostCard: `rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600`
// page.tsx: `rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600`
// → variant prop으로 통일
<TagBadge variant="highlight">{tag}</TagBadge>
<TagBadge variant="neutral">{tag}</TagBadge>
```

---

### Phase 7: FCP / LCP 성능 개선

#### 7-1. 게시글 상세 페이지 스트리밍 적용

현재 `posts/[id]/page.tsx`에서 LikeStatus + Comments를 `Promise.all`로 기다린 후 전체를 렌더링함.
본문 HTML은 먼저 스트리밍하고, 좋아요/댓글은 `<Suspense>`로 지연 렌더링

```tsx
// 변경 전
const [likeStatus, commentsResponse] = await Promise.all([...]);
return <>{본문 + 좋아요 + 댓글}</>;

// 변경 후
return (
  <>
    {/* 즉시 스트리밍 */}
    <PostHeader post={post} />
    <TiptapViewer content={post.content} />

    {/* 지연 렌더링 */}
    <Suspense fallback={<LikeSkeleton />}>
      <LikeSection postId={post.id} />
    </Suspense>
    <Suspense fallback={<CommentSkeleton />}>
      <CommentSection postId={post.id} />
    </Suspense>
  </>
);
```

**효과**: TTI 단축, LCP(본문 텍스트) 개선

#### 7-2. TiptapViewer Dynamic Import 적용

```tsx
// TiptapViewer는 heavy bundle → 동적 로드
const TiptapViewer = dynamic(() => import('@/components/editor/TiptapViewer'), {
  ssr: false,
  loading: () => <ContentSkeleton />,
});
```

> [!WARNING]
> `ssr: false`로 설정하면 초기 HTML에 본문이 없어 SEO에 영향을 줄 수 있습니다.
> HTML 크롤러 호환성을 위해 `ssr: true` 유지 + 클라이언트에서 Hydration만 지연하는 방향도 검토 필요.

#### 7-3. TableOfContents DOM 폴링 개선

현재 `setInterval`로 100ms마다 DOM을 확인 → MutationObserver 기반으로 대체

```ts
// 변경 전
const checkInterval = setInterval(() => {
  const headings = document.querySelectorAll('.prose h2, .prose h3, .prose h4');
  if (headings.length === 0 && attempts < 20) { attempts++; return; }
  clearInterval(checkInterval);
  // ...
}, 100);

// 변경 후
const observer = new MutationObserver(() => {
  const headings = document.querySelectorAll('.prose h2, .prose h3, .prose h4');
  if (headings.length > 0) {
    observer.disconnect();
    headings.forEach((h, i) => { if (items[i]) h.id = items[i].id; });
  }
});
observer.observe(document.body, { childList: true, subtree: true });
```

#### 7-4. 게시글 목록 이미지 Lazy Loading 확인
- `PostCard`는 이미지를 사용하지 않으므로 추가 작업 불필요
- 댓글 섹션의 프로필 이미지에 `loading="lazy"` 적용 (`Image` 컴포넌트는 자동 적용)

---

## 실행 우선순위

| Phase | 작업 | 우선순위 | 예상 효과 |
|---|---|---|---|
| Phase 1 | 타입 정리 + 파일 이동 | ⭐⭐⭐ 높음 | 안정성, 유지보수성 |
| Phase 7-1 | 스트리밍 + Suspense | ⭐⭐⭐ 높음 | LCP 직접 개선 |
| Phase 7-3 | MutationObserver TOC | ⭐⭐ 중간 | 불안정한 폴링 제거 |
| Phase 3 | SideNav 분리 | ⭐⭐ 중간 | Client 번들 감소 |
| Phase 4 | CommentSection 분리 | ⭐⭐ 중간 | 관심사 분리 |
| Phase 6 | 공통 UI 프리미티브 | ⭐⭐ 중간 | 재사용성, 일관성 |
| Phase 2 | 스토어 확장 | ⭐ 낮음 | Props drilling 제거 |
| Phase 5 | PostEditor 분리 | ⭐ 낮음 | 유지보수성 |

---

### Phase 8: MobileHeader 코드 중복 제거

`SideNav.tsx`와 `MobileHeader.tsx`는 두 파일 모두 동일한 `NAV_ITEMS` 상수, `isActive` 로직, 인증 버튼 UI를 독립적으로 중복 정의하고 있다.

#### 문제점
- `NAV_ITEMS` 배열이 두 파일에 각각 정의됨
- `isActive(href)` 함수 로직이 두 파일에서 동일하게 반복
- 로그인/로그아웃 버튼 클래스가 두 파일에서 픽셀 단위로 동일하게 중복

#### 개선 방안
- Phase 1에서 생성하는 `lib/constants/tags.ts`와 유사하게 `lib/constants/nav.ts`로 `NAV_ITEMS` 분리
- Phase 3에서 생성하는 `NavLinks.tsx`, `AuthButtons.tsx` 컴포넌트를 **SideNav와 MobileHeader가 함께 공유**

```ts
// [NEW] src/lib/constants/nav.ts
import { Home, FileText, Briefcase } from 'lucide-react';
export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/posts', label: 'Posts', icon: FileText },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
] as const;
```

```ts
// [NEW] src/hooks/useActiveNav.ts  (재사용 가능한 훅)
'use client';
import { usePathname } from 'next/navigation';
export function useActiveNav() {
  const pathname = usePathname();
  return (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
}
```

**효과**: 네비게이션 항목을 한 곳에서만 관리, SideNav/MobileHeader 모두 적용

---

### Phase 9: Server Action 반환 타입 통일

기존에 `ActionResult<T>` 유니언 타입이 `src/types/action.type.ts`에 정의되어 있음에도 **일부 액션이 이를 사용하지 않고 인라인 리터럴 타입**을 반환하고 있다.

#### 문제점
| 파일 | 반환 타입 |
|---|---|
| `actions/post.ts` (createPost) | 반환 타입 미선언 (추론에 의존) |
| `actions/post.ts` (updatePost) | 수동 리터럴 `{ success: true; postId: string } \| { success: false; error: string }` |
| `actions/comment.ts` (deleteComment) | 반환 타입 미선언 |
| `CommentSection.tsx` | `result.data as unknown as Comment` 강제 캐스트 |

#### 개선 방안

```ts
// ActionResult 제네릭 확장
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// 게시글 액션에 postId 포함 타입 추가
export type PostActionResult = ActionResult<{ postId: string }>;
```

- 모든 Server Action 반환 타입을 `ActionResult<T>`로 명시
- `CommentSection`의 `as unknown as Comment` 캐스트 제거
- `page.tsx`의 `initialComments as any` 제거

---

### Phase 10: `tiptap.ts` 유틸리티 타입 강화

#### 문제점
`extractTocFromTiptap` 함수에서 `any` 타입을 광범위하게 사용하고 있음

```ts
// 현재 코드 (any 남용)
export function extractTocFromTiptap(json: any): TocItem[] {
  const traverse = (node: any) => { ... }
```

- `@ts-ignore` 없이도 동작하나, `strict` 모드 하에서 타입 안전하지 않음

#### 개선 방안
```ts
// JSONContent 타입 활용
export function extractTocFromTiptap(json: JSONContent | unknown): TocItem[] {
  if (!json || typeof json !== 'object') return [];
  const traverse = (node: JSONContent) => { ... }
}
```

#### 추가: ID 충돌 방지
현재 같은 제목이 여러 번 등장하면 동일한 ID가 생성되어 TOC 링크가 동작하지 않을 수 있음

```ts
// ID 중복 방지 처리 추가
const idMap = new Map<string, number>();
let id = baseId;
if (idMap.has(baseId)) {
  const count = idMap.get(baseId)! + 1;
  idMap.set(baseId, count);
  id = `${baseId}-${count}`;
} else {
  idMap.set(baseId, 0);
}
```

---

### Phase 11: `useIntersectionObserver` 폴링 개선

Phase 7-3에서 `TableOfContents`의 `setInterval` 폴링을 `MutationObserver`로 교체하는 계획과 별개로, `useIntersectionObserver` 훅 내부에도 동일한 폴링 패턴이 존재한다.

```ts
// 현재 (hooks/useIntersectionObserver.ts)
const checkInterval = setInterval(() => {
  const elements = elementIds.map(id => document.getElementById(id))...
  if (elements.length > 0 || attempts > 20) { clearInterval(...) }
  attempts++;
}, 100);
```

#### 개선 방안
`elementIds`가 설정된 시점에 이미 DOM에 ID가 부여되어 있다면 즉시 관찰 시작. 없다면 `MutationObserver`로 대기하여 불필요한 100ms 단위 틱 제거

```ts
// 개선 후
const tryObserve = () => {
  const elements = elementIds
    .map(id => document.getElementById(id))
    .filter(Boolean) as HTMLElement[];
  if (elements.length > 0) {
    elements.forEach(el => observerRef.current?.observe(el));
    return true;
  }
  return false;
};

if (!tryObserve()) {
  const mutationObserver = new MutationObserver(() => {
    if (tryObserve()) mutationObserver.disconnect();
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}
```

**효과**: 최대 2,000ms(20회×100ms)의 불필요한 대기 제거

---

### Phase 12: PostList 빈 상태(Empty State) 개선

현재 `PostList` 컴포넌트의 빈 상태에서 "새 글 작성하기" 링크가 **비로그인 사용자에게도 표시**된다.

```tsx
// 현재 (PostList.tsx)
<Link href="/write" className="...">새 글 작성하기 →</Link>
```

#### 개선 방안
- 비로그인 / 일반 사용자: 링크 미표시
- Admin: "새 글 작성하기" 링크 표시

단, `PostList`는 Server Component이므로 `verifyAdminSession()`을 직접 호출할 수 있음

```tsx
// 개선 후
interface PostListProps {
  posts: Post[];
  isAdmin?: boolean;  // 상위 page에서 주입
}
```

---

## 실행 우선순위 (업데이트)

| Phase | 작업 | 우선순위 | 예상 효과 |
|---|---|---|---|
| Phase 1 | 타입 정리 + 파일 이동 | ⭐⭐⭐ 높음 | 안정성, 유지보수성 |
| Phase 7-1 | 스트리밍 + Suspense | ⭐⭐⭐ 높음 | LCP 직접 개선 |
| Phase 9 | Action 반환 타입 통일 | ⭐⭐⭐ 높음 | `as any` 제거, 타입 안전 |
| Phase 10 | tiptap.ts 타입 강화 + ID 중복 방지 | ⭐⭐ 중간 | 런타임 버그 예방 |
| Phase 11 | useIntersectionObserver 폴링 개선 | ⭐⭐ 중간 | 불필요한 틱 제거 |
| Phase 7-3 | MutationObserver TOC | ⭐⭐ 중간 | 불안정한 폴링 제거 |
| Phase 3 + 8 | SideNav/MobileHeader 분리·중복 제거 | ⭐⭐ 중간 | Client 번들 감소, DRY |
| Phase 4 | CommentSection 분리 | ⭐⭐ 중간 | 관심사 분리 |
| Phase 6 | 공통 UI 프리미티브 | ⭐⭐ 중간 | 재사용성, 일관성 |
| Phase 12 | PostList 빈 상태 Admin 분기 | ⭐ 낮음 | UX, 보안 |
| Phase 2 | 스토어 확장 | ⭐ 낮음 | Props drilling 제거 |
| Phase 5 | PostEditor 분리 | ⭐ 낮음 | 유지보수성 |

---

## 변경 파일 목록 요약 (업데이트)

### 신규 생성
- `src/types/comment.type.ts`
- `src/lib/constants/tags.ts`
- `src/lib/constants/nav.ts`
- `src/stores/useEditorStore.ts`
- `src/components/layout/NavLinks.tsx`
- `src/components/layout/AuthButtons.tsx`
- `src/components/post/CommentForm.tsx`
- `src/components/post/CommentList.tsx`
- `src/components/editor/PostTitleInput.tsx`
- `src/components/ui/DropdownMenu.tsx`
- `src/components/ui/IconButton.tsx`
- `src/components/ui/TagBadge.tsx`
- `src/hooks/useDraft.ts`
- `src/hooks/usePostSubmit.ts`
- `src/hooks/useActiveNav.ts`

### 수정
- `src/components/layout/SideNav.tsx` (Server Component화 + NavLinks/AuthButtons 공유)
- `src/components/layout/MobileHeader.tsx` (NavLinks/AuthButtons 공유, NAV_ITEMS 중복 제거)
- `src/components/post/CommentSection.tsx` (Shell로 축소)
- `src/components/post/PostEditor.tsx` (훅 추출 및 Store 활용)
- `src/components/post/PostList.tsx` (빈 상태 Admin 분기)
- `src/components/post/LikeButton.tsx` (Store 활용)
- `src/components/post/TableOfContents.tsx` (MutationObserver)
- `src/hooks/useIntersectionObserver.ts` (MutationObserver 기반으로 폴링 교체)
- `src/lib/utils/tiptap.ts` (any 제거, ID 중복 방지)
- `src/types/action.type.ts` (PostActionResult 타입 추가)
- `src/actions/post.ts` (반환 타입 ActionResult로 통일)
- `src/actions/comment.ts` (반환 타입 ActionResult로 통일, @ts-ignore 제거)
- `src/app/(blog)/posts/[id]/page.tsx` (Suspense 스트리밍, as any 완전 제거)
- `src/app/(blog)/posts/page.tsx` (constants 참조)

### 이동
- `src/components/DeletePostButton.tsx` → `src/components/post/DeletePostButton.tsx`
