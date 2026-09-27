# 데이터베이스 (Supabase / PostgreSQL)

> **범위**: 테이블·RPC의 읽기용 요약.
> **SQL 원본은 `supabase/schema.sql`이다.** 절차와 미적용 항목은 아래 "스키마 파일" 참조.

## 스키마 파일

스키마 원본은 **`supabase/schema.sql`** 하나다. 전체가 idempotent(`CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `CREATE UNIQUE INDEX IF NOT EXISTS`)라서 통째로 다시 실행해도 안전하다. 마이그레이션 러너를 쓰지 않으므로 파일을 날짜별로 쌓지 않는다.

변경 절차: 이 파일을 수정 → 라이브 DB(Supabase SQL Editor)에 해당 구문 실행 → 커밋 → 이 문서의 표 갱신.

⚠️ **라이브 DB 미적용 항목 2건** (파일 안에 ⚠️ 주석으로 표시, 실행 후 주석 삭제):

1. `tech_news` 중복 정리 + `original_url` UNIQUE 인덱스 블록 (`PLAN.md` T-308)
2. 좋아요 테이블·RPC·`posts.like_count` DROP 블록 (`PLAN.md` T-312)

> `posts` / `images`의 CREATE 문과 RPC 함수 본문은 호출부 코드로 재구성한 것이다. 라이브 DB와 어긋나면 **라이브 정의가 우선**이다.

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

업로드 직후 `is_used = false`로 시작하고 게시글 저장 시 `post_id`와 연결된다. 24시간 넘게 연결되지 않으면 크론(`cleanup-images`)이 삭제한다. 자세한 내용은 `AGENTS.md` "반드시 알아야 할 것" 2번을 참고한다.

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

**`original_url` UNIQUE 제약**은 크론 재실행·백필 시 중복 삽입을 막는 최종 방어선이다(라이브 미적용, 위 "스키마 파일" 참조). 애플리케이션의 중복 체크는 `published_at >= sinceDate` 범위 안에서만 동작한다. 라우트는 `23505`를 실패가 아닌 스킵으로 처리하므로 제약 유무와 관계없이 동작한다.

### users, accounts, sessions

Auth.js의 Supabase Adapter가 자동으로 생성하고 관리하는 테이블. FK는 `next_auth.users(id)`를 가리킨다.

## RPC 함수

서버 액션이 `supabase.rpc()`로 호출하는 DB 함수. 정의는 `supabase/schema.sql` 하단을 참고한다.

| 함수 | 인자 | 호출처 | 역할 |
|---|---|---|---|
| `increment_view_count` | `post_id` | `actions/post.ts` | `posts.view_count` +1 |

## RLS 없음 — 권한은 서버 액션이 책임진다

RLS 정책은 없다. 서버가 `service_role` 키로 접근해 RLS를 전면 우회하므로 **권한 통제는 전적으로 서버 액션 코드가 담당한다.** 주의사항은 `AGENTS.md` "반드시 알아야 할 것" 1번, 분리 계획은 `PLAN.md` T-102.
