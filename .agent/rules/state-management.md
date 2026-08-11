# 상태 관리 규칙

## 1. 상태 분류

| 상태 유형 | 관리 도구 | 예시 |
|---|---|---|
| **전역 UI 상태** | Zustand | 모달 열림/닫힘, 사이드바, 토스트 |
| **서버 상태 (변경)** | Server Action + `revalidatePath` | 댓글 작성/삭제, 좋아요 |
| **낙관적 업데이트** | React 19 `useOptimistic` | 댓글 즉시 표시, 좋아요 |
| **로컬 UI 상태** | `useState` | 폼 입력, 토글, 드롭다운 |
| **서버 데이터 (SSR)** | Server Component | 게시글 목록, 상세 페이지 초기 데이터 |

---

## 2. Zustand — 전역 UI 상태

### 2.1 스토어 파일 규칙

- 파일명: `use` + PascalCase + `Store.ts`
- 디렉토리: `src/stores/`
- 하나의 스토어 = 하나의 관심사

```typescript
// stores/useModalStore.ts

/**
 * @file useModalStore.ts
 * @description 전역 모달 상태를 관리하는 Zustand 스토어.
 */

import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  content: React.ReactNode | null;
  open: (content: React.ReactNode) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  content: null,
  open: (content) => set({ isOpen: true, content }),
  close: () => set({ isOpen: false, content: null }),
}));
```

### 2.2 적용 대상

- `useModalStore` — 모달 열림/닫힘 + 콘텐츠
- `useSidebarStore` — 모바일 사이드바 열림/닫힘
- `useToastStore` — 토스트 알림

### 2.3 규칙

- **서버 컴포넌트에서 직접 접근 금지** → 클라이언트 컴포넌트에서만 `use`
- **미들웨어는 필요한 경우만** (persist, devtools 등)
- **selector 사용 권장** — 불필요한 리렌더 방지

```typescript
// ✅ selector로 필요한 값만 구독
const isOpen = useModalStore((state) => state.isOpen);

// ❌ 전체 상태 구독 (불필요한 리렌더 발생)
const { isOpen, content, open, close } = useModalStore();
```

---

## 3. 서버 상태 — Server Action + 낙관적 업데이트

> **TanStack Query는 사용하지 않는다.** 결정 근거는 `PLAN.md`의 `D-001` 참조.
> 이 프로젝트는 클라이언트 데이터 흐름이 댓글·좋아요 두 곳뿐이고, 폴링·무한스크롤·
> 컴포넌트 간 캐시 공유가 없어 쿼리 캐시 레이어가 값을 하지 못한다.
> 검색 기능(`T-402`)을 도입하면 재검토한다.

### 3.1 읽기 — Server Component

초기 데이터는 Server Component에서 Supabase를 직접 조회해 props로 내린다.
클라이언트에서 같은 데이터를 다시 fetch하지 않는다.

```tsx
// app/(blog)/posts/[id]/page.tsx
const commentsResponse = await getComments(postId);
return <CommentSection postId={postId} initialComments={commentsResponse.data ?? []} />;
```

### 3.2 쓰기 — Server Action + `revalidatePath`

변경은 Server Action에서 처리하고, 끝에 `revalidatePath`로 서버 데이터를 갱신한다.

```typescript
// actions/comment.ts
await supabase.from('comments').insert({ ... });
revalidatePath(`/posts/${postId}`);
```

### 3.3 낙관적 업데이트 — React 19 `useOptimistic`

`revalidatePath`는 RSC 트리 전체를 재생성하므로 체감 지연이 있다.
즉시 반영이 필요하면 `useOptimistic`으로 덮고, 액션 완료 시 서버 값으로 수렴시킨다.

```tsx
'use client';

const [optimisticComments, addOptimistic] = useOptimistic(
  initialComments,
  (state, next: Comment) => [...state, next],
);

const handleSubmit = () => {
  startTransition(async () => {
    addOptimistic(draftComment); // 즉시 렌더
    await createComment(input); // 완료 후 revalidatePath 결과로 수렴
  });
};
```

### 3.4 직렬화가 필요한 연타 — 수동 제어

좋아요처럼 연타가 발생하는 토글은 디바운스 + 진행 중 요청 잠금 + 최종 의도만 전송하는
패턴을 직접 구현한다. 구현 예시는 `components/post/LikeButton.tsx` 참조.

---

## 4. 상태 관리 하지 않을 것

- **URL 상태** (필터, 정렬, 페이지): `searchParams`로 관리 (서버 컴포넌트 호환)
- **폼 상태**: `useState` 또는 React 19 `useActionState`
- **테마**: 라이트 모드 only이므로 상태 불필요
