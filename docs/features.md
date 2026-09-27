# 기능 명세

> **스코프**: 인증·게시글·댓글·조회수·뉴스·SEO·에러 처리 동작 명세.
> 서버 액션 작성 규약(`ActionResult<T>`, 권한 → Zod → 로직 → revalidate 순서)은 저장소의 `AGENTS.md`가 원본이다.

## 인증 · 권한

Google OAuth(next-auth v4) + Supabase Adapter를 사용한다. 세션은 JWT 전략을 사용한다.

| 역할 | 판별 | 권한 |
|---|---|---|
| 비로그인 | 세션 없음 | 게시글·뉴스 열람, 조회수 |
| 일반 유저 | Google 세션 존재 | + 댓글 |
| Admin | 세션 이메일 === `ADMIN_EMAIL` | + 게시글 CRUD, 이미지 업로드 |

### 파일 구성

- `lib/auth.ts` — NextAuth 설정 + 권한 헬퍼
- `app/api/auth/[...nextauth]/route.ts` — NextAuth API Route
- `providers/AuthProvider.tsx` — SessionProvider 래퍼(클라이언트)
- `types/next-auth.d.ts` — 세션 타입 확장(`user.id`, `user.isAdmin`)
- `middleware.ts` — `/write`, `/edit` 경로 가드. **서버 액션 호출은 막지 못한다** (`AGENTS.md` 참조)

### 권한 헬퍼

`isAdmin(): boolean` (`lib/auth.ts`) — 유일한 권한 헬퍼. 관리자 권한이 필요한 서버 액션의 첫 줄에서 호출한다.

### 로그인 UI

`signIn('google')` / `signOut()`. 사이드 네비 하단과 모바일 헤더의 로그인/프로필 버튼(`LoginButton`, `ProfileButton`).

## 게시글

### CRUD

- **작성/수정/삭제**: admin만. **열람**: 모든 사용자(비로그인 포함)
- 본문은 Tiptap JSONContent로 DB에 저장
- 목록: 카테고리별 필터링 + 페이지네이션. 글이 없으면 Admin에게만 '새 글 작성' 링크 노출
- 카드 메타: **날짜 · 조회수**만 표시한다. 읽는 시간은 표시하지 않는다
- 카드 제목 헤딩 레벨은 `titleAs` prop으로 지정한다 — posts 목록(h1 아래)은 h2, 홈 섹션(h2 아래)은 기본값 h3

### 상세 페이지 — 본문 렌더링

- **서버에서 정적으로 렌더링한다** (`PostContent`, `@tiptap/static-renderer`). 본문 HTML이 SSR 응답에 그대로 포함되어 검색엔진·링크 미리보기·`#heading` 딥링크가 동작한다
- 읽기 페이지에는 Tiptap 편집 런타임이 포함되지 않는다
- 코드블록은 서버에서 highlight.js로 강조한 뒤 보낸다(`StaticCodeBlock`). 에디터는 lowlight로 같은 결과를 실시간으로 보여 준다
- Mermaid만 클라이언트에서 렌더링한다(`MermaidDiagram`) — mermaid는 브라우저 전용이다. 서버는 스켈레톤을 내보낸다
- **mermaid는 정적 import하지 않는다.** 그릴 때 `import('mermaid')`로 불러오고 `initialize`도 그때 한 번만 실행한다. 정적 import하면 다이어그램이 없는 글에서도 mermaid·d3·dompurify를 내려받아 실행한다
- **다이어그램은 뷰포트에 가까워지면 그린다** (`useInViewOnce`, `rootMargin: '200px 0px'`). 로드 시점에 전부 그리면 메인 스레드를 점유해 본문 LCP가 늦어진다 (`PLAN.md` D-006)
- 이미지는 `<img loading="lazy" decoding="async">`. 원본 크기를 저장하지 않아 `next/image`는 사용할 수 없다
- **표 셀은 직접 매핑한다**: 정적 렌더러는 `class`/`style` 외의 속성명을 그대로 넘기므로, 그대로 두면 `colspan`/`rowspan`이 React 경고를 발생시킨다. 열 너비(`colwidth`)는 에디터에서 resizable 노드뷰가 `colgroup`으로 그리지만 정적 렌더에는 노드뷰가 없으므로, `table` 매핑이 첫 행의 `colwidth`를 읽어 `colgroup`을 만든다

### 상세 페이지 — TOC

- heading(h2~h4)을 파싱해 우측 고정 네비게이션으로 표시(XL 1280px 이상에서만 표시)
- 에디터의 Heading Shift(`#` → h2)를 반영한 계층 매핑: h2=L1, h3=L2, h4=L3
- **헤딩 id는 `PostContent`가 서버 렌더링 시 붙인다.** 페이지가 `extractTocFromTiptap` 결과 하나를 `TableOfContents`와 `PostContent` 양쪽에 넘기므로 id가 항상 일치한다. 텍스트가 없는 헤딩은 양쪽 모두 건너뛴다
- `IntersectionObserver`로 현재 위치를 하이라이트하고, 클릭하면 스무스 스크롤한다. 헤딩에 `scroll-mt-24`를 적용해 고정 헤더 여백을 확보한다

### 상세 페이지 — 이전/다음 글

- 본문 하단(내보내기 버튼 아래, 댓글 위)에 `PostNavigation` 표시
- `created_at` 기준으로 인접 글 2건을 `maybeSingle()`로 조회 — 이전 글 = 더 오래된 글, 다음 글 = 더 최신 글
- 양쪽 모두 없으면(글이 1개뿐이면) 렌더링하지 않음

### 에디터 연동 요점

- **Heading Shift**: `#` 입력 시 `<h2>` 생성(1페이지 1H1 원칙). 자세한 내용은 `editor.md`
- **Export**: 상세 페이지에서 Markdown으로 내보내기(`DropdownMenu` 활용)
- **스키마 동기화**: 에디터에 확장을 추가하면 `PostContent`의 `POST_SCHEMA`에도 추가해야 한다. JSON에 없는 노드 타입이 있으면 정적 렌더링이 실패한다

### 태그

- URL searchParams 기반 필터링. `TAG_DICTIONARY`(`lib/constants/tags.ts`)에 있는 태그만 입력할 수 있고, **배열 순서가 곧 `/posts` 필터 칩 순서**다
- `TagInputField` 자동완성으로 입력 — `keywords`는 검색용이므로 소문자로 적는다(입력값을 소문자로 변환해 비교)
- 현재 사전: Javascript, Typescript, React, Next.js, CSS, Browser, Performance, Testing, Network, Security, Database, Algorithm, Java, Python, etc

**태그는 "어떤 스택인가"가 아니라 "무엇에 대한 글인가"를 기준으로 나눈다.** 따라서 Frontend/Backend처럼 거의 모든 글에 해당하는 태그는 두지 않는다. 인증 관련 글은 `Security`에 넣고, `인증`·`인가`·`oauth`·`jwt`는 keywords로 검색된다.

## 댓글

- **작성**: Google 로그인 사용자만. **삭제**: 본인 또는 admin
- **1단 대댓글**(flat reply): `parent_id`로 연결하며, `null`이면 최상위
- 게시글별 생성순 정렬

**Enter로 입력 내용을 제출한다 — 제출 버튼은 없다.** `Shift+Enter`는 줄바꿈.

`CommentForm`은 `<form>`이 아니라 textarea + `onKeyDown`이다. **`e.nativeEvent.isComposing`을 반드시 먼저 검사한다** — 한글 조합 중 Enter는 글자를 확정하는 데 쓰이므로, 이 가드가 없으면 "안녕"을 입력하는 도중 "안녕"이 그대로 등록된다. 같은 가드가 `TagInputField`에도 있다.

전송 중에는 textarea를 disabled 상태로 두고 하단 힌트 문구를 `작성 중...`으로 바꾼다. 버튼이 없으므로 이것이 유일한 진행 표시다.

```typescript
interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userImage: string;
  parentId: string | null;
  content: string;
  createdAt: Date;
}
```

## 조회수

- `ViewCounter` 클라이언트 컴포넌트가 마운트될 때 `incrementViewCount` Server Action 호출
- `viewed_posts` 쿠키로 24시간 이내 동일 게시글 중복 집계 방지
- 화면에는 DB 저장값을 그대로 표시. 조회수 증가는 렌더링 이후에 일어나 최초 조회자에게 1 낮게 보이지만, 재방문자에게 부풀려 보이는 것보다 정확하다

> ⚠️ 중복 방지가 클라이언트 쿠키에만 있어 Server Action을 직접 호출하면 무제한으로 늘릴 수 있다. 서버 측 검증 필요 — `PLAN.md` T-101.

## 기술 뉴스

프론트엔드 관련 RSS를 수집해 한국어 마크다운으로 요약하고 `tech_news`에 저장한다.

### 목록 · 상세 표시

- 목록: 소스 필터(FilterChip) + 페이지네이션(20개/페이지, 공용 `Pagination` 사용)
- 카드 날짜는 상대 시간(`formatRelativeTime`, "3시간 전")으로 표시 — 뉴스는 신선도가 중요하다
- 상세 본문은 게시글과 동일한 `.prose` 스타일을 사용 — `globals.css`가 단일 출처

### 수집 소스

| source | 피드 |
|---|---|
| `react` | `react.dev/rss.xml` |
| `nextjs` | `nextjs.org/feed.xml` |
| `typescript` | `devblogs.microsoft.com/typescript/feed/` |
| `chrome` | `developer.chrome.com/static/blog/feed.xml` |
| `tailwindcss` | `tailwindcss.com/feeds/feed.xml` |
| `javascript` | `javascriptweekly.com/rss/` |

### 파이프라인 (`/api/cron/fetch-news`, 매일 00:00 UTC)

1. `Authorization: Bearer $CRON_SECRET` 검증 → 불일치 시 401
2. 날짜 기준 계산(기본 `DEFAULT_SINCE_DAYS`=2일, `?days=N` / `?since=YYYY-MM-DD`로 재정의)
3. 기존 `original_url` 일괄 조회(N+1 방지)
4. 피드별 파싱 — 실패는 `feedsFailed`/`errors`에 집계(조용히 넘기지 않는다)
5. 날짜 필터로 스킵 → **LLM 호출 전에** 걸러 비용 절감
6. 신규 기사 원문 수집(`lib/article.ts`). 실패하면 RSS 설명으로 대체하고, 근거 텍스트가 400자 미만이면 게시를 보류한다(`deferred`)
7. gpt-4o-mini로 요약한 뒤 INSERT, 기사 간 1초 딜레이

### 비용·안정성 가드

- 피드별 timeout 15초(rss-parser 기본 60초)
- 전체 실행 시간이 250초를 초과하면 중단하고 `timeout: true` 반환(Vercel `maxDuration` 300초 대비)
- 429는 지수 백오프로 3회 재시도, 크레딧 소진(`exceeded your current quota`)은 즉시 실패
- `?days=N`으로 백필 가능. 중복은 건너뛰므로 반복 실행해도 안전하다

### 필수 환경변수

`CRON_SECRET`, `OPENAI_API_KEY` — **Vercel에도 등록해야 한다.** 누락 시 크론은 처리를 시작하기 전에 명시적으로 실패한다: `CRON_SECRET` 불일치/부재는 **401**, `OPENAI_API_KEY` 부재는 사전 검사에서 **500**. 200을 반환하며 조용히 실패하면 장애가 드러나지 않으므로 이 동작을 유지한다.

## Google Analytics 4

- `next/script`로 GA 스크립트 로드(`afterInteractive` 전략)
- 측정 ID: `G-ZL70EZYFER`
- Vercel Analytics + Speed Insights 병행 운영

## SEO

| 경로 | 내용 | 갱신 |
|---|---|---|
| `/sitemap.xml` | 정적 경로 + 전체 게시글 + 전체 뉴스 | 1시간 ISR |
| `/robots.txt` | `/write`, `/edit/`, `/api/` 차단 + 사이트맵 링크 | 정적 |
| `/feed.xml` | 자체 RSS 2.0, 최신 20건. 요약은 Tiptap 본문에서 추출 | 1시간 ISR |

- 절대 URL은 `lib/constants/site.ts`의 `SITE_URL`을 단일 출처로 사용한다
- `sitemap.ts`의 `revalidate`를 제거하면 빌드 시점에 고정되어 새 글이 재배포 전까지 반영되지 않는다. **반드시 유지할 것**
- 게시글 상세는 `generateMetadata`로 OpenGraph 메타 생성(본문 160자 요약)

## 에러 처리

| 파일 | 범위 |
|---|---|
| `app/(blog)/error.tsx` | (blog) 그룹 렌더링 예외. `reset()` 재시도 + `error.digest` 노출 |
| `app/(blog)/loading.tsx` | Server Component가 Supabase 응답을 기다리는 동안 표시할 스켈레톤 |
| `app/not-found.tsx` | 일치하는 경로가 없거나 `notFound()`를 호출한 경우 |

Server Action 반환 규약(`ActionResult<T>`, 예외를 던지지 않음)은 `AGENTS.md` 서버 액션 섹션이 원본이다. 클라이언트는 실패를 토스트로 표시한다.
