-- =============================================================================
-- tech_news.original_url UNIQUE 인덱스 (PLAN.md T-308)
-- =============================================================================
-- ⚠️ 상태: 라이브 DB 미적용. Supabase SQL Editor에서 실행 후 이 주석을 갱신할 것.
--
-- 크론 재실행/백필 시 중복 수집의 최종 방어선이다. fetch-news 라우트의
-- 애플리케이션 레벨 중복 체크는 published_at >= sinceDate 윈도우 안에서만
-- 동작하므로, 윈도우 밖 중복은 이 인덱스만 막을 수 있다.
-- 라우트는 인덱스 유무와 무관하게 동작한다 (23505를 스킵 처리).
-- =============================================================================

-- 1. 인덱스 생성 전에 기존 중복 행 정리 (가장 먼저 수집된 행만 유지)
DELETE FROM tech_news a
USING tech_news b
WHERE a.original_url = b.original_url
  AND a.created_at > b.created_at;

-- 2. UNIQUE 인덱스 생성
CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_news_original_url ON tech_news(original_url);
