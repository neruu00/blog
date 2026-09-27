# 데이터베이스 (Supabase / PostgreSQL)

> **스코프**: 테이블·RPC의 읽기용 요약.
> **SQL의 원본은 저장소의 `supabase/schema.sql`다.** 스키마를 바꿀 때는 그 파일을 수정하고 라이브 DB에 실행한 뒤, 이 문서의 표를 함께 갱신한다. 절차와 미적용분은 아래 "스키마 파일" 참조.

## 스키마 파일

스키마의 원본은 저장소의 **`supabase/schema.sql`** 하나다. 전체가 idempotent(`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `CREATE UNIQUE INDEX IF NOT EXISTS`)이므로 통째로 다시 실행해도 안전하다. 버전을 추적하는 마이그레이션 러너(Supabase CLI)를 쓰지 않기 때문에 파일을 날짜별로 쌓지 않는다 — 2026-08-19에 `supabase/migrations/` 2개 파일을 통합했다.

변경 절차: 이 파일을 수정 → 라이브 DB(Supabase SQL Editor)에 해당 구문 실행 → 커밋 → 이 문서의 표 갱신.

⚠️ **라이브 DB 미적용분 2건** (파일 안에 ⚠️ 주석으로 표시, 실행 후 주석 삭제):

1. `tech_news` 중복 정리 + `original_url` UNIQUE 인덱스 블록 (`PLAN.md` T-308)
2. 좋아요 기능 제거 DROP 블록 — `likes` 테이블, `increment/decrement_like_count` RPC, `posts.like_count` 컬럼 (`PLAN.md` D-004)

> `posts` / `images` 의 CREATE 문과 RPC 함수 본문은 마이그레이션 기록이 없던 시기의 것을 컬럼 문서와 호출부 코드로부터 재구성한 것이다. 라이브 DB와의 drift가 의심되면 **라이브 정의가 우선**이다.

## 테이블

### posts

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `title` | TEXT | — | 게시글 제목 |
| `content` | JSONB | — | Tiptap JSONContent |
| `tags` | TEXT[] | `{}` | 태그 배열 |
| `author` | TEXT | `'admin'` | 작성자 |
| `category` | TEXT | `'tech'` | 카테고리 |
| `view_count` | INTEGER | `0` | 조회수 |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |
| `updated_at` | TIMESTAMPTZ | `now()` | 수정일 |

(`like_count`는 2026-08-20 좋아요 기능 제거로 스키마에서 삭제 — 라이브 DROP은 위 미적용분 2번)

### comments

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `post_id` | UUID | — | FK → posts(id) ON DELETE CASCADE |
| `user_id` | UUID | — | FK → users(id) ON DELETE CASCADE |
| `parent_id` | UUID | `NULL` | FK → comments(id) ON DELETE CASCADE (대댓글, 1단) |
| `content` | TEXT | — | 댓글 내용 |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |

### images

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | UUID | PK |
| `url` | TEXT | 이미지 Public URL |
| `post_id` | UUID | FK → posts(id) |
| `is_used` | BOOLEAN | 사용 중 여부 |
| `created_at` | TIMESTAMPTZ | 업로드 시간 |

업로드 직후 `is_used = false`로 시작하고 게시글 저장 시 `post_id`와 연결된다. 24시간 넘게 연결되지 않으면 크론(`cleanup-images`)이 삭제한다. 상세는 `AGENTS.md` "반드시 알아야 할 것" 2번.

### tech_news

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `title` | TEXT | — | 기사 원제 |
| `original_url` | TEXT | — | 원문 URL |
| `content` | TEXT | — | LLM이 생성한 마크다운 요약 |
| `source` | TEXT | — | 피드 소스 (`react`, `nextjs`, `typescript`, `chrome`, `tailwindcss`, `javascript`) |
| `published_at` | TIMESTAMPTZ | — | 원문 발행일 (RSS `isoDate`/`pubDate`) |
| `created_at` | TIMESTAMPTZ | `now()` | 수집 시간 |

**UNIQUE 제약 권장**: `original_url` — 크론 재실행/백필 시 중복 삽입 방지 (아직 미적용, 위 "스키마 파일" 참조).
`/api/cron/fetch-news`가 애플리케이션 레벨에서도 중복을 거르지만, 그 체크는 `published_at >= sinceDate` 윈도우 안에서만 동작하므로 DB 제약이 최종 방어선이다. 라우트는 제약 유무와 무관하게 동작한다 — `23505`를 실패가 아닌 스킵으로 처리한다.

### users, accounts, sessions

Auth.js의 Supabase Adapter가 자동으로 생성/관리하는 테이블. FK는 `next_auth.users(id)`를 가리킨다.

## RPC 함수

서버 액션이 `supabase.rpc()`로 호출하는 DB 함수. 정의는 `supabase/schema.sql` 하단 참조.

| 함수 | 인자 | 호출처 | 역할 |
|---|---|---|---|
| `increment_view_count` | `post_id` | `actions/post.ts` | `posts.view_count` +1 |

## RLS 없음 — 권한은 서버 액션이 진다

RLS 정책은 없다. 서버가 `service_role` 키로 접근해 RLS를 전면 bypass하므로 **권한 통제는 전적으로 서버 액션 코드에 있다.** 작업 시 주의사항은 `AGENTS.md` "반드시 알아야 할 것" 1번, 분리 계획은 `PLAN.md` T-102 참조.
