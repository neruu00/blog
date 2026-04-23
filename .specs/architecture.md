# 아키텍처 스펙

## 1. 기술 스택

| 항목 | 값 |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 (custom theme) |
| Font | Pretendard (본문) + Geist Mono (코드) |
| DB | Supabase (PostgreSQL) |
| Auth | next-auth v4 (Google OAuth) |
| Editor | Tiptap + Mermaid |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Validation | Zod |
| Analytics | GA4 + Vercel Analytics |
| Icons | Lucide React |
| Deploy | Vercel |
| Git Hooks | Husky + lint-staged |

---

## 2. 디렉토리 구조

```
src/
├── actions/              # Server Actions (도메인별 분리)
│   ├── post.ts
│   ├── comment.ts
│   ├── like.ts
│   └── image.ts
│
├── app/
│   ├── (blog)/           # 공개 페이지 그룹 (사이드 네비 레이아웃)
│   │   ├── layout.tsx    # SideNav + Main 영역
│   │   ├── page.tsx      # 홈
│   │   ├── posts/
│   │   │   ├── page.tsx          # 게시글 목록
│   │   │   └── [id]/page.tsx     # 게시글 상세
│   │   └── portfolio/
│   │       └── page.tsx          # 포트폴리오
│   │
│   ├── (protected)/      # 관리자 전용 (인증 guard)
│   │   ├── layout.tsx    # requireAdmin guard
│   │   ├── write/page.tsx
│   │   └── edit/[id]/
│   │       └── _components/EditPostClient.tsx
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth 핸들러
│   │   └── cron/cleanup-images/route.ts
│   │
│   ├── layout.tsx        # Root layout (Providers, Font, GA)
│   └── globals.css       # Tailwind custom theme 정의
│
├── components/
│   ├── DeletePostButton.tsx  # 게시글 삭제 버튼
│   ├── post/             # 게시글 도메인 컴포넌트
│   │   ├── PostCard.tsx
│   │   ├── CommentSection.tsx
│   │   ├── LikeButton.tsx
│   │   ├── ViewCounter.tsx
│   │   └── TableOfContents.tsx
│   ├── editor/           # Tiptap 에디터
│   │   ├── TiptapEditor.tsx
│   │   ├── TiptapViewer.tsx
│   │   ├── Toolbar.tsx
│   │   ├── TagInputField.tsx
│   │   └── extensions/
│   │       ├── CustomCodeBlock.ts       # Mac 스타일 코드블록 Extension
│   │       ├── CodeBlockComponent.tsx   # CodeBlock React NodeView
│   │       ├── MermaidBlock.tsx         # Mermaid Node Extension
│   │       └── MermaidComponent.tsx     # Mermaid React NodeView
│   └── layout/           # 레이아웃 컴포넌트
│       ├── SideNav.tsx
│       ├── MobileHeader.tsx
│       └── Footer.tsx
│
├── hooks/
│   └── useOptimisticLike.ts
│
├── layouts/
│   └── TanstackQueryLayout.tsx  # TanStack Query Provider
│
├── lib/
│   ├── auth.ts           # NextAuth 설정 + 헬퍼
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── logger.ts         # 로깅 유틸리티
│   └── utils/
│       ├── tiptap.ts     # Tiptap 텍스트/이미지/TOC 추출
│       └── date.ts       # 날짜 포맷팅
│
├── providers/
│   └── AuthProvider.tsx  # NextAuth SessionProvider 래퍼
│
├── schemas/              # Zod 스키마
│   ├── post.schema.ts
│   └── comment.schema.ts
│
├── stores/               # Zustand 스토어
│   ├── useLikeStore.ts
│   ├── useModalStore.ts
│   ├── useSidebarStore.ts
│   └── useToastStore.ts
│
└── types/
    ├── post.type.ts
    ├── comment.type.ts
    ├── user.type.ts
    ├── action.type.ts    # ActionResult<T> 통합 반환 타입
    └── next-auth.d.ts    # NextAuth 타입 확장
```

---

## 3. 라우트 그룹

| 그룹 | 경로 | 레이아웃 | 인증 |
|---|---|---|---|
| `(blog)` | `/`, `/posts`, `/posts/[id]`, `/portfolio` | SideNav + Footer | 불필요 |
| `(protected)` | `/write`, `/edit/[id]` | 최소 레이아웃 | admin 필수 |
| `api` | `/api/auth/*`, `/api/cron/*` | 없음 | 용도별 |

---

## 4. 데이터 흐름

```
[사용자] → [Server Component] → [Supabase] → [SSR 렌더링]
                                                    │
[사용자] → [Client Component] → [Server Action] → [Supabase]
                │                                      │
                └── [TanStack Query] ← 캐싱/낙관적 업데이트
                │
                └── [Zustand] ← 전역 UI 상태
```
