# AGENTS.md

Next.js 15 App Router 기반 1인 기술 블로그. 관리자만 글을 쓰고, Google 로그인 사용자는 댓글·좋아요만 할 수 있다. 매일 RSS 6곳을 수집해 LLM으로 요약하는 뉴스 큐레이션이 함께 돌아간다.

이 문서는 **코드에서 읽어낼 수 없는 것**만 담는다. 파일 목록이나 구현 세부는 `.specs/`를 보라.

---

## 명령어

| 목적 | 명령 |
|---|---|
| 개발 서버 | `pnpm dev` (Turbopack, :3000) |
| 프로덕션 빌드 | `pnpm build` |
| 린트 | `pnpm lint` |
| 타입 검사 | `npx tsc --noEmit` |
| **전체 검증** | `pnpm verify` — 타입 + 린트 + 빌드 |
| 포맷 | `pnpm format` |

패키지 매니저는 **pnpm 고정**이다. npm/yarn을 쓰면 lockfile이 깨진다.

작업을 끝내기 전 `pnpm verify`가 통과해야 한다.

> **브랜치를 바꾼 직후 `tsc`가 없는 파일을 못 찾겠다고 하면** 이전 브랜치의 빌드 캐시 탓이다.
> `tsconfig.json`이 `.next/types/**`를 포함하기 때문에, 사라진 라우트를 참조하는
> `validator.ts`가 남아 에러를 낸다. `rm -rf .next` 후 다시 실행하면 된다.

---

## 반드시 알아야 할 것

이 항목들은 코드를 읽어서는 알기 어렵고, 모르면 사고가 난다.

### 1. Supabase 클라이언트는 `service_role`이다 — RLS가 없다

`lib/supabase.ts`의 클라이언트 하나가 공개 조회부터 관리자 쓰기까지 전부 처리하며 **RLS를 전면 우회한다.** 따라서 **모든 서버 액션이 스스로 권한을 검사해야 한다.**

`middleware.ts`가 `/write`, `/edit`을 막지만 **미들웨어는 서버 액션 호출을 막지 못한다.** 미들웨어만 믿고 액션에서 검사를 생략하면 그대로 뚫린다.

```ts
export async function createPost(formData: FormData) {
  if (!(await verifyAdminSession())) return { success: false, error: '관리자 권한이 필요합니다.' };
  // ...
}
```

인증이 필요 없는 액션(예: 조회수 증가)은 **누구나 직접 호출할 수 있다**고 가정하고 설계하라.

### 2. 이미지는 2단계 정리 파이프라인을 탄다

업로드된 이미지는 `is_used = false`로 시작하고, 게시글 저장 시 `post_id`와 연결된다. 24시간 넘게 연결되지 않으면 크론이 삭제한다. `actions/post.ts`에는 각 단계 실패에 대한 롤백·강제삭제 경로가 있다. **이미지 관련 코드를 수정할 때 이 경로를 깨뜨리지 말 것.** 깨지면 스토리지에 좀비 파일이 남는다.

### 3. 설치돼 있지만 쓰지 않는 것

| 대상 | 상태 |
|---|---|
| TanStack Query | provider는 마운트돼 있으나 `useQuery`/`useMutation` 호출 0건. **새로 쓰지 말 것** (`PLAN.md` D-001) |
| `lib/logger.ts` | 사용처 0건. ESLint가 `console.warn`/`console.error`를 허용하므로 그대로 쓰면 된다 |

---

## 코드 규칙

### 파일명

| 종류 | 패턴 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase `.tsx` | `PostCard.tsx` |
| 서버 액션 | 도메인명 `.ts` | `actions/post.ts` |
| Zod 스키마 | `*.schema.ts` | `post.schema.ts` |
| Zustand 스토어 | `use*Store.ts` | `useModalStore.ts` |
| 커스텀 훅 | `use*.ts` | `useIntersectionObserver.ts` |
| 타입 | `*.type.ts` | `post.type.ts` |

### TypeScript

- `strict: true`. `any` 금지 — 불가피하면 `unknown` + 타입 가드, 또는 정확한 타입으로 캐스팅
- Props는 `interface`로, 컴포넌트 바로 위에 선언
- 외부 입력은 `as`로 단언하지 말고 Zod `safeParse`로 검증

### 주석

- 파일 상단에 `@file` / `@description` 블록
- 인라인 주석은 **왜(Why)**를 쓴다. 무엇을/어떻게는 코드가 설명한다
- 주석 처리된 죽은 코드는 커밋하지 않는다

### 포맷 · import 순서

손으로 맞추지 마라. ESLint(`import/order`)와 Prettier가 커밋 시 `lint-staged`로 자동 정리한다. 설정은 `eslint.config.mjs`, `.prettierrc`에 있다.

---

## 컴포넌트

**만들기 전에 먼저 찾는다.** `components/ui/`(Modal, Tooltip, TagBadge, IconButton, DropdownMenu, Skeleton)와 `components/common/`(Pagination, ConfirmDialog)에 이미 있는 것을 우선 쓴다. 비슷한 걸 하나 더 만들지 않는다.

**서버 컴포넌트가 기본이다.** `'use client'`는 훅·이벤트 핸들러·브라우저 API·Zustand 구독이 필요한 **최소 리프**에만 붙인다. 페이지 전체를 클라이언트로 만들지 않는다.

```
page.tsx (서버)
  └── PostList (서버)
        ├── PostCard (서버 — 표시만)
        └── LikeButton (클라이언트 — 클릭 처리)
```

| 디렉토리 | 용도 |
|---|---|
| `components/ui/` | 범용 프리미티브 (Modal, Tooltip, TagBadge) |
| `components/common/` | 도메인 무관 공통 (Pagination, ConfirmDialog) |
| `components/post/` | 게시글 도메인 |
| `components/news/` | 뉴스 도메인 |
| `components/editor/` | Tiptap 에디터 |
| `components/layout/` | SideNav, Footer 등 |

### 로딩 상태

**서버 응답을 기다리는 지점을 빈 화면으로 두지 않는다.** 아래 중 하나는 반드시 있어야 한다.

| 상황 | 수단 |
|---|---|
| 라우트 전환 | `(blog)/loading.tsx` |
| 페이지 일부 (댓글·좋아요 등) | `<Suspense>` + 스켈레톤 |
| 버튼·폼 제출 | `useTransition`의 `isPending`으로 비활성화 + 문구 변경 |
| 무거운 클라이언트 번들 | `next/dynamic`의 `loading` 옵션 (`TiptapViewer` 참고) |

---

## 서버 액션

순서를 지킨다: **권한 확인 → Zod 검증 → 로직 → `revalidatePath`**

반환은 예외를 던지지 말고 `ActionResult<T>`로 통일한다.

```ts
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };
```

- 사용자에게는 일반적인 메시지만 반환한다. 내부 에러는 `console.error`로 서버 로그에만 남긴다
- `formData.get()` 결과를 그대로 쓰지 않는다. Zod로 파싱한 `data`만 사용한다
- 변경 후 필요한 경로만 최소한으로 `revalidatePath`한다

---

## 상태 관리

| 종류 | 도구 |
|---|---|
| 전역 UI (모달·토스트·사이드바) | Zustand — selector로 필요한 값만 구독 |
| 서버 데이터 초기값 | Server Component에서 조회해 props로 전달 |
| 서버 데이터 변경 | Server Action + `revalidatePath` |
| 낙관적 업데이트 | React 19 `useOptimistic` |
| 폼 · 로컬 UI | `useState` / `useActionState` |
| 필터 · 정렬 · 페이지 | `searchParams` (전역 상태로 만들지 않는다) |

연타가 발생하는 토글(좋아요)은 디바운스 + 진행 중 요청 잠금 + 최종 의도만 전송하는 패턴을 쓴다. 구현 예시는 `components/post/LikeButton.tsx`.

---

## 스타일링

**다크모드는 없다.** 라이트 모드 전용이며 `dark:` 클래스를 쓰지 않는다. (도입 검토는 `PLAN.md` T-405)

### 색

- Tailwind **기본 팔레트를 우선** 사용한다. 포인트 컬러는 `orange-500`
- 기본 팔레트에 없거나 시맨틱 이름이 필요할 때만 `globals.css`의 `@theme inline`에 토큰을 추가한다 (`surface`, `code-bg` 등)
- **임의 hex를 새로 쓰지 않는다** (`bg-[#eee]`). 필요한 색이 팔레트에 없다면 정말 필요한지부터 의심하고, 필요하면 `@theme`에 토큰으로 추가한다
  - 현재 예외: `CodeBlockComponent.tsx`의 Mac 창 색상, `EditorFooter.tsx`의 그림자. 해당 파일을 손대게 되면 토큰으로 옮긴다

### 텍스트 계층

3단만 쓴다. 임의의 gray를 끌어다 쓰지 않는다.

| 계층 | 클래스 | 용도 |
|---|---|---|
| primary | `text-gray-900` | 제목, 본문 |
| secondary | `text-gray-500` | 날짜, 메타 정보 |
| muted | `text-gray-400` | 비활성, placeholder |

> 현재 코드에는 `gray-300`부터 `gray-800`까지 7종이 섞여 있다. **새 코드는 위 3단만 쓰고**, 기존 파일을 수정할 때 함께 정리한다.

### 플랫 & 미니멀

선을 최소화하고 **배경색 차이로 구역을 나눈다.** 짙은 테두리와 강한 그림자를 기본값으로 두지 않는다.

- Badge·Callout류는 테두리 없이 부드러운 배경만 쓴다 (`TagBadge`: `bg-orange-50 text-orange-600`)
- 구분선은 `border-gray-100`, 카드 경계는 `border-gray-200`
- 그림자는 **실제로 떠 있는 요소**(모달, 드롭다운, FAB)에만. 평면 카드에는 쓰지 않는다

### 그 외

- **인라인 `style`은 런타임 계산값에만** 쓴다. 정적인 값은 전부 Tailwind 유틸리티로 (허용 예: `EyePoster`의 커서 추적 transform, 스켈레톤의 동적 너비)
- 아이콘은 **`lucide-react`만** 쓴다. 다른 아이콘 라이브러리를 추가하지 않는다
- 사이드 네비는 `lg`(1024px) 기준으로 전환된다. 모바일은 `MobileHeader`
- 기본 트랜지션은 `transition-colors`. 복잡한 애니메이션만 `globals.css`에 `@keyframes`로

---

## 참고 문서

| 문서 | 내용 |
|---|---|
| `PLAN.md` | 개선 백로그와 결정 로그. **작업 전에 관련 항목이 있는지 확인하라** |
| `.specs/architecture.md` | 디렉토리 구조, 라우트 그룹, 데이터 흐름 |
| `.specs/database.md` | 테이블 스키마, 마이그레이션 SQL |
| `.specs/features.md` | 게시글·댓글·좋아요·뉴스·SEO 동작 명세 |
| `.specs/auth.md` | NextAuth 설정, 권한 체계 |
| `.specs/editor.md` | Tiptap 확장 |
| `.specs/design-system.md` | 컬러, 타이포그래피 |

코드를 바꾸면 해당 스펙 문서도 같이 갱신한다. 문서가 코드와 어긋나면 다음 작업자가 그 문서를 믿고 잘못된 코드를 쓴다.

---

## AI 에이전트에게

- **이 문서와 어긋나는 코드를 발견하면 고치기 전에 알린다.** 문서가 틀렸을 수도 있다. 실제로 이 저장소의 이전 규칙 문서는 존재하지 않는 함수와 패턴을 지시한 채 방치돼 있었다.
- **스펙 문서와 코드가 다르면 코드가 정답이다.** 문서를 고치고, 고쳤다고 알린다.
- 즉석에서 해결하기 어려운 문제를 발견하면 `PLAN.md`에 항목으로 남긴다. 조용히 넘기지 않는다.
- 규칙에 예외를 두어야 한다면 **이유를 코드 주석에 남긴다.** 다음 사람이 "왜 여기만 다르지"로 시간을 쓰지 않게.
