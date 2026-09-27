# 아키텍처

> **스코프**: 기술 스택, 코드 진입점, 라우트 그룹, 데이터 흐름.
> 코드 규칙·컴포넌트 인벤토리·스타일 규칙은 저장소의 `AGENTS.md`가 원본이다.
> 구조는 코드를 원본으로 삼는다. 파일 단위 트리는 여기 적지 않는다.

## 기술 스택

| 항목 | 값 |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 (custom theme) |
| Font | Pretendard (본문) + Geist Mono (코드) |
| DB | Supabase (PostgreSQL) |
| Auth | next-auth v4 (Google OAuth) |
| Editor | Tiptap + Mermaid |
| Server State | Server Action + `revalidatePath` |
| Client State | Zustand |
| 뉴스 수집 | rss-parser + OpenAI gpt-4o-mini (Vercel Cron) |
| Validation | Zod |
| Analytics | GA4 + Vercel Analytics |
| Icons | Lucide React |
| Deploy | Vercel |
| Git Hooks | Husky + lint-staged |

## 코드 진입점

전체 파일 목록이 필요하면 `find src -type f`를 실행하라. 아래에는 길을 잃었을 때 참고할 진입점만 적는다.

| 영역 | 위치 | 비고 |
|---|---|---|
| 페이지 라우트 | `src/app/(blog)/`, `src/app/(protected)/` | 그룹별 권한은 아래 "라우트 그룹" 참고 |
| API · 크론 | `src/app/api/` | NextAuth, fetch-news, cleanup-images |
| SEO 메타 라우트 | `src/app/` — `sitemap.ts`, `robots.ts`, `feed.xml/` | 1h ISR |
| 서버 액션 | `src/actions/` | post / comment / image, 도메인별 1파일 |
| 도메인 로직 | `src/lib/` | auth, supabase(service_role), rss, article, llm, export, image-converter |
| 상수 | `src/lib/constants/` | tags, nav, site(SITE_URL), portfolio |
| 컴포넌트 | `src/components/` | 분류 기준은 `AGENTS.md` 컴포넌트 섹션 참고 |
| 상태 | `src/stores/` (Zustand), `src/hooks/` | |
| 검증 · 타입 | `src/schemas/` (Zod), `src/types/` | `ActionResult<T>`는 `action.type.ts` |
| 미들웨어 | `src/middleware.ts` | `/write`, `/edit` 경로 가드 |

## 라우트 그룹

| 그룹 | 경로 | 레이아웃 | 인증 |
|---|---|---|---|
| `(blog)` | `/`, `/posts`, `/posts/[id]`, `/news`, `/news/[id]`, `/about` | SideNav + Footer | 불필요 |
| `(protected)` | `/write`, `/edit/[id]` | 최소 레이아웃 | admin 필수 (`middleware.ts` + 서버 액션 이중 검증) |
| `api` | `/api/auth/*`, `/api/cron/*` | 없음 | 크론은 `CRON_SECRET` Bearer 검증 |
| 메타 | `/sitemap.xml`, `/robots.txt`, `/feed.xml` | 없음 | 불필요 (1h ISR) |

`/about`는 포트폴리오 페이지다. DB를 거치지 않고 `lib/constants/portfolio.ts`만 읽어 완전히 정적으로 렌더링된다.

## 데이터 흐름

```
[사용자] → [Server Component] → [Supabase] → [SSR 렌더링]
                                                    │
[사용자] → [Client Component] → [Server Action] → [Supabase]
                │                       │
                │                       └── revalidatePath → RSC 재생성
                │
                └── [Zustand] ← 전역 UI 상태 (모달/토스트/사이드바)

[Vercel Cron] → [fetch-news] → [RSS 6종 + 원문] → [gpt-4o-mini] → [tech_news]
             └→ [cleanup-images] → 24h 경과 고아 이미지 삭제
```
