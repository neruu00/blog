# 상태 관리 규칙

## 1. 상태 분류

| 상태 유형 | 관리 도구 | 예시 |
|---|---|---|
| **전역 UI 상태** | Zustand | 모달 열림/닫힘, 사이드바, 토스트 |
| **서버 상태 (캐싱)** | TanStack Query | 댓글 목록, 좋아요 수, 게시글 데이터 |
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

## 3. TanStack Query — 서버 상태 캐싱

### 3.1 사용 시점

- 서버 컴포넌트의 초기 데이터만으로 부족할 때 (실시간 갱신 필요)
- 낙관적 업데이트가 필요한 경우 (좋아요, 댓글)
- 클라이언트에서 데이터를 refetch해야 하는 경우

### 3.2 Query Key 규칙

```typescript
// 계층적 키 구조
const queryKeys = {
  comments: {
    all: ['comments'] as const,
    byPost: (postId: string) => ['comments', postId] as const,
  },
  likes: {
    byPost: (postId: string) => ['likes', postId] as const,
  },
};
```

### 3.3 낙관적 업데이트 패턴 (좋아요)

```typescript
const likeMutation = useMutation({
  mutationFn: toggleLike,
  onMutate: async (postId) => {
    // 1. 진행 중인 쿼리 취소
    await queryClient.cancelQueries({ queryKey: ['likes', postId] });

    // 2. 이전 캐시 스냅샷 저장
    const previous = queryClient.getQueryData(['likes', postId]);

    // 3. 캐시 즉시 갱신 (낙관적)
    queryClient.setQueryData(['likes', postId], (old) => ({
      ...old,
      isLiked: !old.isLiked,
      count: old.isLiked ? old.count - 1 : old.count + 1,
    }));

    return { previous };
  },
  onError: (_err, _postId, context) => {
    // 4. 에러 시 롤백
    queryClient.setQueryData(['likes', postId], context?.previous);
  },
  onSettled: () => {
    // 5. 최종 동기화
    queryClient.invalidateQueries({ queryKey: ['likes', postId] });
  },
});
```

### 3.4 기본 옵션 (유지)

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryOnMount: true,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});
```

---

## 4. 상태 관리 하지 않을 것

- **URL 상태** (필터, 정렬, 페이지): `searchParams`로 관리 (서버 컴포넌트 호환)
- **폼 상태**: `useState` 또는 React 19 `useActionState`
- **테마**: 라이트 모드 only이므로 상태 불필요
