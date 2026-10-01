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
| `(blog)` | `/`, `/posts`, `/posts/[id]`, `/news`, `/news/[id]` | SideNav + Footer | 불필요 |
| `(portfolio)` | `/portfolio`, `/portfolio/about`, `/portfolio/project`, `/portfolio/project/[projectName]` | Windows 95 바탕화면 + 작업 표시줄 | 불필요 |
| `(protected)` | `/write`, `/edit/[id]` | 최소 레이아웃 | admin 필수 (`middleware.ts` + 서버 액션 이중 검증) |
| `api` | `/api/auth/*`, `/api/cron/*` | 없음 | 크론은 `CRON_SECRET` Bearer 검증 |
| 메타 | `/sitemap.xml`, `/robots.txt`, `/feed.xml` | 없음 | 불필요 (1h ISR) |

`/portfolio`는 포트폴리오 페이지다. 블로그와 달리 SideNav 없이 Windows 95 바탕화면을 사용하고, 진입 시 한 번 칸 단위로 진행 막대가 차오르는 부팅 화면(`Win95Boot`)을 보여준다. 바탕화면에는 아이콘 두 개만 있고, 경로마다 창이 하나씩 열린다. `about` 앱은 `/portfolio/about`에서 소개·기술·교육 창을, `project` 폴더는 `/portfolio/project`에서 프로젝트 앱 목록 창을 연다. 프로젝트 앱에 마우스를 올리면 대표 캡처·기간·주장을 담은 미리 보기 대화상자가 커서를 따라다니고, 클릭하면 `/portfolio/project/[projectName]` 문서 창이 열린다. `projectName`에는 `Project.slug`(소문자 영문명)가 들어간다. 작업 표시줄 맨 왼쪽의 "블로그" 버튼을 누르면 블로그로 돌아간다. 화면은 뷰포트 크기로 고정되어 문서가 늘어나지 않고, 내용이 긴 창은 창 본문만 스크롤한다. 모든 페이지는 DB를 거치지 않고 `lib/constants/portfolio.ts`만 참조한다. 문서 창은 `generateStaticParams`로 빌드 시점에 모두 생성하며, `dynamicParams = false`이므로 목록에 없는 이름은 404를 반환한다. `next.config.ts`에서 `/about`은 `/portfolio/about`으로, `/projects`와 `/projects/[projectName]`은 `/portfolio/project` 아래의 대응 경로로 영구 리다이렉트한다.

각 프로젝트는 서비스 한 줄(`tagline`)과 주장 한 문장(`claim`), 대표 이미지(`cover`), 짧은 소개(`intro`), 구조 다이어그램(`architecture`)을 갖고, 과제는 문제·재정의·선택·검증·한계 순으로 나누고 수치(`metric`)와 시각 자료(`visuals`)를 붙인다. 수치에는 출처 등급(실측·인용·계산·구조·못 잼)을 함께 적고, 다이어그램은 mermaid 코드로 두어 `MermaidDiagram`이 그린다. 아직 캡처가 없는 이미지는 `media` 없이 두면 화면에 이미지 자리로 나온다. 상세 페이지 오른쪽(xl 이상)에는 게시글 상세와 같은 `TableOfContents`로 목차를 띄운다. 목차 항목은 `buildProjectToc`가 소개·구조·해결한 과제(과제마다 하위 항목)·회고 순으로 만들고, `ProjectDetail`이 같은 id를 헤딩에 붙인다.

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
