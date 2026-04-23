# Blog

> 개발 기술 블로그 — Tiptap 에디터, Mermaid 다이어그램, Google OAuth 기반

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)

## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| **Tiptap 에디터** | Mac 스타일 코드 블록 (구문 강조), Mermaid 다이어그램 (Flowchart, Mindmap, Sequence), 이미지 업로드 |
| **Google OAuth** | NextAuth v4 기반 소셜 로그인, Admin 권한 분리 |
| **게시글 CRUD** | 작성/수정/삭제 (Admin), 태그 필터링, 조회수 (쿠키 중복 방지) |
| **댓글 시스템** | Google 로그인 사용자 전용, 1단 대댓글, 실시간 토스트 알림 |
| **좋아요** | 낙관적 업데이트 + 디바운싱, 사용자당 게시글당 1회 |
| **포트폴리오** | 프로필, 기술 스택, 프로젝트 경험 카드 레이아웃 |
| **애널리틱스** | GA4 커스텀 이벤트 (좋아요, 댓글, 조회수) + Vercel Analytics |
| **UI 시스템** | 커스텀 전역 Modal 및 Toast 알림 |

## 🛠️ 기술 스택

| 분류 | 기술 |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | NextAuth v4 (Google OAuth) |
| Editor | Tiptap + Mermaid.js |
| State | TanStack Query v5 (서버), Zustand (클라이언트) |
| Validation | Zod |
| Deploy | Vercel |
| Git Hooks | Husky + lint-staged |

## 📁 프로젝트 구조

```text
src/
├── actions/          # Server Actions (post, comment, like, image)
├── app/
│   ├── (blog)/       # 공개 페이지 (홈, 게시글, 포트폴리오)
│   ├── (protected)/  # 관리자 전용 (글쓰기, 수정)
│   └── api/          # NextAuth API 라우트
├── components/
│   ├── editor/       # Tiptap 에디터 + 확장 (CodeBlock, Mermaid)
│   ├── layout/       # SideNav, MobileHeader, Footer
│   ├── post/         # PostCard, PostList, CommentSection, LikeButton
│   └── ui/           # 범용 UI (ToastContainer, Modal)
├── hooks/            # useIntersectionObserver, useOptimisticLike
├── lib/              # auth, supabase, logger, analytics
├── schemas/          # Zod 검증 스키마
├── stores/           # Zustand (toast, modal, sidebar, like)
└── types/            # TypeScript 타입 정의
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- pnpm
- Supabase 프로젝트
- Google OAuth 클라이언트

### 설치

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env.local
```

### 환경 변수 (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
ADMIN_EMAIL=...
```

### 개발 서버 구동

```bash
pnpm dev
```

## 📐 스펙 문서

프로젝트의 상세 기술 명세는 `.specs/` 디렉토리에서 확인할 수 있습니다:

- [아키텍처](.specs/architecture.md) — 디렉토리 구조, 라우트 그룹, 데이터 흐름
- [인증](.specs/auth.md) — NextAuth 설정, 권한 체계
- [데이터베이스](.specs/database.md) — 테이블 스키마, 마이그레이션 SQL
- [디자인 시스템](.specs/design-system.md) — 컬러, 타이포그래피, 레이아웃
- [에디터](.specs/editor.md) — Tiptap 확장, CodeBlock, Mermaid
- [기능](.specs/features.md) — 게시글, 댓글, 좋아요, 조회수, 포트폴리오

## 📝 라이선스

MIT © [neruu00](https://github.com/neruu00)
