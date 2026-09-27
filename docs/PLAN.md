# 개선 계획

> 개선 백로그와 결정 로그. **작업 전에 관련 항목이 있는지 확인한다.**
> 최종 갱신: 2026-09-27 (cushion `blog` 라이브러리에서 저장소 `docs/`로 이관)
>
> 완료된 항목은 이 문서에서 걷어냈다 — git 이력에 남아 있으니 되살리지 않는다.
> 남긴 것은 **아직 할 일**과 **뒤집히면 안 되는 결정**뿐이다.
> 줄번호는 리팩토링마다 밀리므로 파일 경로만 적는다.

## 📌 결정 로그

향후 작업자(사람/에이전트)가 뒤집지 않도록 결정과 근거를 남긴다.

### D-001. TanStack Query를 댓글·좋아요에 적용하지 않는다 (2026-08-11)

**결정**: 서버 상태 캐싱 목적으로 TanStack Query를 도입하지 않는다.

**근거**:

- 클라이언트 데이터 흐름이 댓글·좋아요 두 곳뿐이고, 둘 다 Server Action + `revalidatePath`로 이미 동작한다.
- 폴링, 무한스크롤, 윈도우 포커스 refetch, 컴포넌트 간 캐시 공유가 전무하다. 라이브러리의 핵심 가치가 발동하지 않는다.
- 댓글의 체감 지연은 React 19 네이티브 `useOptimistic`으로 해결 가능하다. 의존성 없이 같은 결과를 얻는 쪽이 우선한다.
- `components/post/LikeButton.tsx`의 직렬화 로직은 이미 정상 동작한다. 동작하는 코드를 의존성으로 대체하는 것은 이득이 아니다.

**재검토 조건**: 검색 기능(`T-402`)을 도입할 경우. 검색어별 캐시, `placeholderData: keepPreviousData`, 자동 요청 취소는 RSC나 `useOptimistic`으로 대체하기 번거롭다.

패키지는 제거됐다 — 재도입 시 `pnpm add` + provider 재마운트로 복구된다.
(2026-08-20 갱신: 좋아요가 D-004로 제거되어 클라이언트 데이터 흐름은 이제 댓글 하나다 — 이 결정은 더 강하게 성립한다.)

### D-002. 문서 구조 원칙 (2026-08-11, 2026-08-19 · 2026-09-27 갱신)

**결정**:

- 규칙은 `AGENTS.md` 단일 파일로 유지한다. 분리는 400줄을 넘거나 특정 디렉토리 전용 규칙이 쌓일 때만 하며, 그때도 글롭 룰 파일이 아니라 중첩 `CLAUDE.md`(해당 디렉토리 작업 시에만 로드) 방식을 쓴다.
- 구현 상세 스펙과 이 백로그는 저장소 `docs/`에 둔다. 규칙과 겹치는 내용은 `AGENTS.md` 포인터로 대체한다.
  (이력: 2026-08-19 `.specs/`와 루트 `PLAN.md`를 외부 문서 시스템 cushion으로 옮겼다가, 2026-09-27 외부 의존을 없애려고 `docs/`로 되돌렸다. 코드와 같은 커밋에서 문서를 갱신·리뷰할 수 있어야 드리프트가 줄어든다.)
- **DB 스키마의 원본은 `supabase/schema.sql`다.** (2026-08-19 `supabase/migrations/` 2개 파일을 idempotent 단일 파일로 통합했다 — 버전을 추적하는 마이그레이션 러너가 없어 파일을 쌓을 이유가 없었다.) `database.md`는 읽기용 요약이다.
- 파일 단위 디렉토리 트리를 문서에 두지 않는다 — 이틀 사이 두 번 드리프트했다. 구조의 원본은 코드다.

**근거**: 규칙이 `.agent/rules/` 5개 파일로 분산돼 있던 시기에 존재하지 않는 함수·패턴을 지시하는 허구가 수개월 방치됐다. 문서는 줄이고 모을수록 부패 방어가 쉽다.

### D-003. 홈은 EyePoster + 뉴스 + 최신 글만, 본문 prose는 단일 출처 (2026-08-20, 같은 날 갱신)

2026-08-19 디자인 리뷰의 보류 항목을 소유자 결정으로 종결. 처음엔 인사말 카피 교체("기록 작동 중" + REC 점)와 TechStackPoster(기술 스택 세로 무한 루프)를 넣었으나, **같은 날 소유자 결정으로 둘 다 제거**했다.

**결정**:

- 홈 포스터는 `EyePoster`(방범카메라)만. `InteractivePoster`(홀로포일)·`poster1.jpg`·`TechStackPoster`는 삭제됐다 — 시그니처는 하나여야 한다.
- 홈은 시각적 제목/인사말 없이 포스터(1/5) + 최신 뉴스(4/5)로 바로 시작한다. 문서 아웃라인용 `sr-only` h1("neruu00.log")만 둔다.
- 본문 prose 스타일은 `globals.css`의 `.prose` 오버라이드가 단일 출처. 페이지별 인라인 `prose-*` 체인(구 뉴스 상세)은 금지.
  (2026-08-27 갱신: 게시글 상세의 `prose prose-lg … text-gray-900` 래퍼는 D-005로 사라졌다. 이제 `prose`는 `PostContent`·`TiptapEditor`·뉴스 상세 래퍼 세 곳에만 붙는다 — `design-system.md` 타이포그래피.)

**주의**: 인사말·기술스택 루프를 다시 넣자는 제안은 이 로그를 근거로 소유자에게 먼저 확인할 것.

### D-004. 좋아요 기능 전면 제거 (2026-08-20)

**결정**: 좋아요 기능을 코드·스키마·문서에서 전부 제거한다. 로그인의 존재 이유는 이제 댓글 하나다.

**근거**:

- 비용 대비 가치 최악: 가장 복잡한 클라이언트 상태 머신(LikeButton 132줄, 디바운스+잠금+직렬화+롤백), DB 테이블+인덱스 2+RPC 2+비정규화 컬럼, 게시글 상세 뷰마다 쿼리 2회 — 그 대가가 로그인 사용자만 누를 수 있는 하트 하나였다.
- 대다수 방문자(비로그인)에게는 "로그인이 필요합니다" 거절 경험만 제공했다.
- 결정적으로 `posts.like_count` 비정규화 파이프라인은 **write-only였다** — RPC 2개가 성실히 갱신하는 값을 읽는 코드가 없었다 (화면 카운트는 `likes` 테이블 직접 COUNT). 기능이 검증 없이 자란 증거.
- 참여 신호는 view_count + GA4로 충분하다.

**제거 범위**: `LikeButton.tsx`, `actions/like.ts`, `trackLikeToggle`, `Post.likeCount`+매퍼, 상세 페이지 좋아요 섹션, `likes` 테이블·인덱스·RPC 2개·`posts.like_count`(schema.sql), print CSS `[data-like-button]`, AGENTS.md·README·features.md·database.md 관련 서술.

**라이브 DB DROP은 T-312** — 실행은 사람이 한다.

**재검토 조건**: 없음에 가깝다. 방문자 반응 수단이 정말 필요해지면 로그인 없는 익명 반응(view 기반 또는 쿠키 기반)을 새로 설계하는 편이 이 구현의 부활보다 낫다.

### D-005. 게시글 본문은 서버에서 정적 렌더링한다 — `@tiptap/static-renderer` 도입 (2026-08-27)

**결정**: 읽기 화면의 본문을 클라이언트 Tiptap 에디터(`TiptapViewer`, `editable: false`) 대신 `@tiptap/static-renderer`로 서버 컴포넌트(`PostContent`)에서 렌더링한다. `TiptapViewer`는 삭제.

**근거**:

- **본문이 서버 HTML에 없었다.** `useEditor({ immediatelyRender: false })`는 서버에서 null을 돌려주므로 `dynamic({ ssr: true })`를 걸어도 스켈레톤만 나갔다. 페이지 주석의 "SSR 유지로 SEO 무영향"은 사실이 아니었다 — 9개 글 전부 curl 응답에 본문 요소가 0개. 검색엔진·링크 미리보기는 본문을 못 봤고 OG description만 JSON에서 따로 계산해 살아 있었다.
- 읽기 전용 페이지가 편집 런타임 전체를 실었다: `/posts/[id]` first-load JS **495 kB → 308 kB**, 페이지 청크 209 kB → 21.8 kB.
- 헤딩 id를 `MutationObserver`로 hydration 뒤에 심어야 했고, 그 탓에 `#heading` 딥링크가 첫 로드에서 스크롤되지 않았다. 지금은 서버가 id를 붙인다.
- 스켈레톤이 두 겹(페이지 `dynamic loading` → 뷰어 자체 폴백)으로 깜빡이던 것도 사라졌다.

**왜 이 패키지인가**: 서버에서 Tiptap JSON을 HTML로 바꾸는 선택지는 셋이다. `@tiptap/core`의 `generateHTML`은 DOM이 필요해 서버에서 못 쓰고, `@tiptap/html`은 `zeed-dom` 셰도우 DOM에 의존한다. `@tiptap/static-renderer`는 Tiptap 3 공식 패키지로 DOM 없이 JSON → React 요소를 만들고 노드별 매핑 오버라이드를 지원한다 — 코드블록·이미지·테이블·Mermaid를 우리 컴포넌트로 바꿔 끼우기에 맞는 도구다. 새 의존성이라 소유자 확인 후 추가했다 (`3.22.5`, 나머지 Tiptap 패키지와 버전 고정).

**따라오는 구조**:

- **스키마/노드뷰 분리**: 서버 렌더러는 스키마만 필요하다. `MermaidBlockSchema`(정의만) ← `MermaidBlock`(노드뷰 붙임). 노드뷰 확장을 서버에서 import하면 mermaid·`@tiptap/react`가 서버 번들로 끌려온다.
- **코드블록 프레임 단일화**: Mac 스타일 프레임을 `CodeBlockFrame`으로 빼서 에디터 NodeView와 `StaticCodeBlock`이 공유. 서버는 `highlight.js/lib/common`으로 강조를 끝내 HTML로 보낸다 (에디터의 lowlight `common`과 같은 언어 집합).
- **Mermaid는 클라이언트**: `MermaidDiagram`(코드 → SVG)을 에디터 미리보기와 읽기 화면이 공유. 서버는 스켈레톤만 내보낸다.
- **에디터 확장을 추가하면 `PostContent`의 `POST_SCHEMA`에도 추가해야 한다.** 스키마에 없는 노드 타입이 JSON에 있으면 정적 렌더가 실패한다 — `AGENTS.md` "반드시 알아야 할 것".

**재검토 조건**: 본문에 클라이언트 상호작용(접기, 탭, 실행 가능한 코드 등)이 필요해질 때. 그때도 뷰어 전체를 클라이언트로 돌리지 말고 해당 노드 매핑만 클라이언트 컴포넌트로 바꾼다 — Mermaid가 그 선례다.

### D-006. mermaid는 동적 import + 뷰포트 진입 시 렌더 (2026-09-16)

**결정**: `MermaidDiagram`에서 mermaid를 정적 import하지 않고 그릴 때 `import('mermaid')`로 받는다. 다이어그램은 뷰포트에 가까워졌을 때만 렌더한다(`useInViewOnce`, `rootMargin: '200px 0px'`). `mermaid.initialize()`도 모듈 최상단에서 동적 로더 안으로 옮겼다.

**무엇이 문제였나**: 게시글 LCP가 느렸고, 원인 가설은 "mermaid 렌더가 끝나야 텍스트가 보인다"였다. **그 가설은 틀렸다.** 본문은 D-005 이후 서버 렌더라 이미 먼저 나오고(JS를 끄면 FCP 123ms), `MermaidDiagram`에는 이미 스켈레톤이 있었다. LCP 요소도 다이어그램이 아니라 본문 텍스트(`<p>`)였다.

**실제 원인은 메인스레드 블로킹이었다**:

- `PostContent`가 `MermaidDiagram`을 정적 import → mermaid + d3 + dompurify가 `/posts/[id]` 라우트 번들에 들어갔다. **다이어그램이 0개인 글도** 이걸 내려받아 실행했다 (확인한 글 10개 중 3개가 0개).
- 다이어그램 6개짜리 글에서 **5개가 첫 화면 밖**인데 로드 시점에 전부 그렸다.

**측정값** (로컬 프로덕션 빌드, headless Chrome, 캐시 비움 — 필드 데이터가 아니라 비교용):

| 항목 | 이전 | 이후 |
|---|---|---|
| `/posts/[id]` First Load JS | 308 kB | **157 kB** |
| `/write`·`/edit/[id]` First Load JS | 487 kB | **337 kB** |
| 상세 전용 초기 청크(비압축) | 644.5 kB | **17.1 kB** |
| 다이어그램 0개 글이 받는 JS | 306 kB | **158 kB** |
| 로드 시 렌더되는 다이어그램 | 6개 | **1개** (첫 화면 안) |
| LCP — 4x CPU (3회 중간값) | 2176 ms | **1024 ms** |
| long task 합 — 4x CPU | 1558 ms | **523 ms** |
| LCP — 4x CPU + slow 4G (7회 중간값) | 2428 ms | **2104 ms** |
| long task 합 — 4x CPU + slow 4G | 1247 ms | **229 ms** |

**측정 함정**: 회차별 편차가 크다. slow 4G를 3회만 재면 이상치 하나에 중간값이 2288 → 2760 ms로 뒤집혀 **개선이 회귀로 보인다.** 7회로 늘려야 방향이 안정됐다. 이 페이지의 성능 수치는 3회로 판단하지 말 것.

**따라오는 구조**: `Reveal`이 쓰던 "한 번만 진입 감지" IntersectionObserver를 `useInViewOnce`(`hooks/`)로 추출해 `Reveal`과 `MermaidDiagram`이 공유한다 — AGENTS.md 승격 규칙(두 번째 작성 시점)에 따른 것. ID로 "지금 보이는 요소"를 좇는 기존 `useIntersectionObserver`(TOC용)와는 별개 훅이다.

**남은 것**: 상세 페이지는 여전히 `ƒ`(요청마다 SSR)이고 `isAdmin()` → `getPost()` → 인접 글 조회가 직렬로 돈다. TTFB는 로컬에서 작게 보이지만 스트리밍이라 측정에 가려진다 — 실제 부하에서 다시 볼 항목.

**재검토 조건**: 다이어그램이 첫 화면 안에 오는 글이 많아지면 `rootMargin`을 키우거나 첫 다이어그램만 즉시 렌더하는 예외를 둘 수 있다. 정적 import로 되돌리지는 말 것 — 다이어그램 없는 글이 비용을 치른다.

## ⏳ 라이브 반영·확인 대기

코드/SQL은 있고 라이브 시스템에 반영 또는 확인이 안 된 것들.

- [ ] **T-308** `supabase/schema.sql`의 **`tech_news` 중복 정리 + `original_url` UNIQUE 인덱스 블록이 라이브 DB에 미적용**이다. 파일 안에 ⚠️ 주석으로 표시돼 있다. Supabase SQL Editor에서 실행 후 그 주석을 지운다. 크론 재실행/백필 시 중복 수집의 최종 방어선 — 애플리케이션 레벨 체크는 `published_at >= sinceDate` 윈도우 안에서만 동작한다.
- [ ] **T-312** 좋아요 기능 제거(D-004)의 **라이브 DB DROP 미실행**. `schema.sql`의 ⚠️ "좋아요 기능 제거" 블록을 Supabase SQL Editor에서 실행 후 블록을 삭제한다:
  `DROP FUNCTION IF EXISTS increment_like_count(UUID); DROP FUNCTION IF EXISTS decrement_like_count(UUID); DROP TABLE IF EXISTS likes; ALTER TABLE posts DROP COLUMN IF EXISTS like_count;`
  (코드는 이미 어떤 like 객체도 참조하지 않으므로 실행 전에도 앱은 정상 동작한다. 실행은 사람이 한다.)
- [ ] **T-003** 뉴스 크론 정상 동작 확인 — 수정은 커밋 `3575b92`로 배포됐으나 실제 크론 응답에서 `feedsFailed: 0`, `failed: 0`을 확인한 기록이 없다. 확인 후 이 항목을 지운다.

## 🔒 T-1. 보안 · 데이터 무결성

- [ ] **T-101** **조회수 조작 차단** — `incrementViewCount`(`actions/post.ts`)는 인증 없는 public server action이고 중복 방지가 클라이언트 쿠키(`components/post/ViewCounter.tsx`)에만 있다. 액션을 직접 호출하면 무한 증가한다. IP+postId 기반 서버측 기록 또는 rate limit 필요.
- [ ] **T-102** **RLS 분리** — `lib/supabase.ts`가 공개 조회부터 관리자 쓰기까지 `service_role` 단일 클라이언트로 처리해 RLS를 전면 bypass한다. 서버 액션 하나의 권한 체크 누락이 곧 DB 전체 노출이다. 공개 읽기를 anon 키 + RLS로 분리하고, 나아가 NextAuth 세션 기반으로 Supabase JWT를 커스텀 발급해 익명 읽기·관리자 쓰기를 **DB 엔진 레벨에서** 통제한다.
- [ ] **T-103** **댓글·좋아요 rate limit** — 로그인만 하면 무제한 작성 가능하다.
- [ ] **T-105** Vercel의 미사용 시크릿 `OTP_SECRET`, `SESSION_SECRET` 정리 — 코드에서 참조 0건 (2026-08-19 재확인).

## 🎯 T-2. 정확성 · UX

- [ ] **T-203** 캐싱 전략 — **일부 완료**: 홈·`/news/[id]`는 `force-static` + 5분 ISR 적용. **함정: supabase-js fetch가 캐시 옵션 없이 나가 `revalidate`만으로는 동적에 남는다 — `force-static`이 필수다.** 잔여: `/news`·`/posts`는 `searchParams`, `/posts/[id]`는 세션 의존으로 동적 유지 중(각 파일에 사유 주석). 필터의 경로 세그먼트화 또는 관리자 UI의 클라이언트 세션 전환 시 ISR 확대 가능. `revalidateTag` 세분화도 미착수.
- [ ] **T-204** 댓글 작성 시 `revalidatePath`로 페이지 RSC 트리 전체가 재생성된다(`actions/comment.ts`). 댓글 하나에 `getPost`+`getLikeStatus`+`getComments`+`verifyAdminSession`이 모두 재실행된다. → `useOptimistic` 적용 (D-001 참조).
- [ ] **T-205** 폼 상태를 수동 관리 중이다 — `hooks/usePostSubmit.tsx`, `stores/useEditorStore.ts`의 `isSubmitting` 등. React 19 `useActionState` + `useFormStatus`로 선언적 리팩토링하면 보일러플레이트가 줄고 동시성 안전성이 확보된다.
- [ ] **T-206** **`/posts/[id]` 번들이 First Load JS 500 kB로 전 라우트 중 최대다** (2026-08-19 빌드 재실측, 페이지 자체 210 kB). Tiptap 런타임 전체가 읽기 전용 페이지에 실린다. 작성/수정 시 `@tiptap/html`의 `generateHTML`로 정적 HTML을 사전 생성해 별도 컬럼에 저장하고, 상세 페이지는 에디터 라이브러리 없이 렌더한다. 초기 로드·SEO 모두 개선된다.
- [ ] **T-207** 게시글 본문 이미지가 `next/image`를 타는지 확인 — `components/editor/extensions/ImageComponent.tsx`. 업로드 시 WebP 변환(`lib/image-converter.ts`)은 이미 있으나 렌더 측 레이지 로딩·`srcSet` 적용 여부는 미확인.

## 🧹 T-3. 정리

- [ ] **T-309** 테스트 0건 (2026-08-19 재확인 — 테스트 파일도, 테스트 스크립트도 없다). `pnpm verify`는 타입·린트·빌드만 검사해 로직 회귀를 못 잡는다. 최소한 이미지 롤백(`actions/post.ts`)은 커버가 필요하다. (기존 1순위 후보였던 `LikeButton` 동기화는 2026-08-20 기능 제거로 소멸 — D-004)
- [x] ~~**T-310** 디자인 시스템화~~ — 2026-08-27 완료. `ui/Button` 하나로 통합(variant 4종·size 3종, `href`면 `next/link`, 토글은 `aria-pressed`)하고 `IconButton`을 흡수했다. CVA는 넣지 않았다 — `cn()`(tailwind-merge)에 Record 매핑이면 충분해 의존성을 늘릴 이유가 없었다. `Input`은 사용처가 에디터 폼 몇 곳뿐이라 보류.
- ~~**T-311** `posts.like_count` write-only 파이프라인~~ — 좋아요 기능 자체가 제거되며 소멸 (2026-08-20, D-004). 라이브 DROP은 T-312.
- [ ] **T-313** `next start`가 `routesManifest.dataRoutes is not iterable`로 죽는다. `pnpm build`가 `--turbopack`으로 만든 산출물을 `next start`가 못 읽는 조합 문제로 보인다. **`pnpm dev`와 Vercel 배포에는 영향이 없다** — 로컬에서 프로덕션 HTML을 확인할 때만 막힌다. Next 15.5.9 + Turbopack 조합 이슈인지 확인이 필요하다. (2026-08-27 발견)
- [ ] **T-314** 읽기 본문 글자 크기가 갈려 있다 — 뉴스 상세는 `prose-lg`(18px)가 먹고 게시글 상세(`PostContent`)는 16px다. 편집 화면(`TiptapEditor`)도 16px이라 18로 올리면 편집·읽기가 어긋난다. 셋을 어디에 맞출지 소유자 결정이 필요하다. 각각 한 단어 변경. (`design-system.md` 타이포그래피 참조)
- [ ] **T-315** 죽은 코드 3건: ① `FloatingActionButton`의 `pathname === '/write'` 가드 — FAB은 `(blog)` 레이아웃 전용이라 `(protected)`의 `/write`·`/edit`에서는 애초에 렌더되지 않는다 ② `globals.css` print 블록의 `[data-toolbar], .editor-toolbar` — 어디에도 붙지 않은 셀렉터 ③ `.prose h1` 규칙 — `ShiftedHeading`이 레벨 2~4만 허용해 작성 자체가 불가능한 태그를 스타일링한다. (2026-08-27 발견)
- [ ] **T-316** 게시글 이미지에 원본 width/height를 저장하지 않아 `next/image`를 쓸 수 없고, 로드 전 자리를 못 잡아 CLS가 난다. 업로드 시(`actions/image.ts`) 크기를 JSON attrs에 넣으면 `aspect-ratio`로 자리를 예약하고 `next/image`도 가능해진다. 정적 렌더 전환(D-005)으로 `loading="lazy"`는 들어갔으나 CLS는 남아 있다. (2026-08-27 발견)
- [ ] **T-317** 모바일에 목차가 전혀 없다 — `TableOfContents`가 `hidden xl:block`이라 1280px 미만에서 사라진다. 접이식 상단 목차 하나면 된다. 헤딩 id는 이제 서버가 붙이므로(D-005) 추가 배선이 필요 없다. (2026-08-27 발견)
- [ ] **T-318** `Testing` 태그 적중 0건 — 2026-08-27 태그 개편 때 넣었지만 아직 해당 글이 없다. `Auth`를 뺀 기준(적중 1건)을 그대로 적용하면 후보다. 다만 성격이 다르다: Auth는 *이름이 틀렸고*, Testing은 *아직 안 쓴 주제*다. 테스트 글을 쓸 계획이 없으면 제거한다. (T-309와 함께 판단)

## 🚀 T-4. 신규 기능 (임팩트 순)

- [ ] **T-402** **검색** — 글 수가 적으면 `title ilike`로 시작, 늘어나면 `to_tsvector` + GIN. **D-001 재검토의 선행 항목이다.**
- [ ] **T-403** 동적 OG 이미지 — `next/og`의 `ImageResponse`로 게시글 제목·태그를 조합한 썸네일을 자동 생성한다. 링크 공유 시 카드 노출.
- [ ] **T-405** 다크 모드 — 토큰이 이미 `app/globals.css`의 `@theme`에 정의돼 있다. 현재 규칙은 라이트 전용(`dark:` 금지)이므로 도입은 `AGENTS.md` 스타일링 섹션 갱신을 동반한다.
- [ ] **T-406** 이전/다음 글, 태그 기반 관련 글.
- [ ] **T-407** 뉴스 요약 품질 — RSS `description`만 LLM에 투입한다(`lib/rss.ts`, 1500자 컷). 원문 본문을 읽지 않아 프롬프트가 요구하는 "코드 예시 / 마이그레이션 가이드" 섹션이 자주 빈다. 본문 fetch를 추가하거나 해당 섹션을 프롬프트에서 제거한다.
- [x] **T-408** 포트폴리오 — **신규 구축으로 결정, `/about`으로 완료됐다.** 데이터는 `lib/constants/portfolio.ts` 하나가 단일 출처이고 DB를 타지 않는다(CMS화는 하지 않았다). 렌더링은 `components/portfolio/`의 `ProjectSection`·`FeatureCarousel`·`ProjectIndex`가 맡는다.
  - 화면 캡처가 있는 기능은 캐러셀 칸이 되고, `media`가 없는 기능은 캐러셀 아래 목록으로 렌더링된다. 캡처를 다 찍지 못한 프로젝트도 기능 목록은 남길 수 있다.
  - 남은 일: 프로젝트별 `retrospective`가 세코미에만 있다. 펭귄밀크·바리스테이션·구루밍·쿠션은 비어 있어 회고 블록이 렌더링되지 않는다.

## ❓ 미해결 질문

1. **Vercel 플랜은?** `api/cron/fetch-news/route.ts`의 `maxDuration = 300`은 주석대로 Pro 기준이다. Hobby라면 실제 상한 확인이 필요하다.

(2~4번이던 디자인 리뷰 보류 항목은 D-003으로 종결됐다.)
