# 데이터베이스 스펙 (Supabase / PostgreSQL)

## 1. 테이블 구조

### posts (기존 + 컬럼 추가)

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `title` | TEXT | — | 게시글 제목 |
| `content` | JSONB | — | Tiptap JSONContent |
| `tags` | TEXT[] | `{}` | 태그 배열 |
| `author` | TEXT | `'admin'` | 작성자 |
| `category` | TEXT | `'tech'` | 카테고리 (신규) |
| `view_count` | INTEGER | `0` | 조회수 (신규) |
| `like_count` | INTEGER | `0` | 좋아요 수 (신규, 비정규화) |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |
| `updated_at` | TIMESTAMPTZ | `now()` | 수정일 (신규) |

### comments (신규)

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `post_id` | UUID | — | FK → posts(id) ON DELETE CASCADE |
| `user_id` | UUID | — | FK → users(id) ON DELETE CASCADE |
| `parent_id` | UUID | `NULL` | FK → comments(id) ON DELETE CASCADE (대댓글) |
| `content` | TEXT | — | 댓글 내용 |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |

### likes (신규)

| 컬럼 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | PK |
| `post_id` | UUID | — | FK → posts(id) ON DELETE CASCADE |
| `user_id` | UUID | — | FK → users(id) ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | `now()` | 생성일 |

**UNIQUE 제약**: `(post_id, user_id)` — 유저당 게시글당 1회 좋아요

### images (기존 유지)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | UUID | PK |
| `url` | TEXT | 이미지 Public URL |
| `post_id` | UUID | FK → posts(id) |
| `is_used` | BOOLEAN | 사용 중 여부 |
| `created_at` | TIMESTAMPTZ | 업로드 시간 |

### users, accounts, sessions (Auth.js 자동 생성)
Auth.js의 Supabase Adapter가 자동으로 생성/관리하는 테이블.

---

## 2. 마이그레이션 SQL

```sql
-- posts 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'tech';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- comments 테이블
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- likes 테이블
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
```

---

## 3. RLS (Row Level Security)

Supabase 서비스 역할 키(`SUPABASE_SERVICE_ROLE_KEY`)를 사용하는 서버 측에서는 RLS를 bypass하지만, 추후 클라이언트 직접 접근이 필요하면 RLS 정책을 추가해야 한다.
