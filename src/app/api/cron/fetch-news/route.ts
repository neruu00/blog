/**
 * @file route.ts
 * @description Vercel Cron Job: 기술 뉴스 RSS 피드 수집 및 LLM 요약 저장.
 *              매일 UTC 00:00 (KST 09:00)에 실행된다.
 *
 * 파이프라인:
 *   1. Authorization 헤더 검증 (CRON_SECRET)
 *   2. 날짜 필터 기준 계산 (기본: 최근 7일)
 *   3. 각 RSS 피드 파싱
 *   4. 날짜 필터 → original_url 중복 체크
 *   5. 신규 기사만 GPT-4o-mini로 요약
 *   6. tech_news 테이블에 INSERT
 *
 * 쿼리 파라미터 (수동 실행 시 사용):
 *   ?days=N         — 최근 N일 이내 기사만 처리 (기본값: 7)
 *   ?since=YYYY-MM-DD — 특정 날짜 이후 기사만 처리
 */

import { NextResponse } from 'next/server';

import { summarizeToMarkdown } from '@/lib/llm';
import { parseFeed, RSS_FEEDS } from '@/lib/rss';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Vercel Cron 최대 실행 시간 (초). Pro 플랜 기준 300초.
export const maxDuration = 300;

/** 기본 날짜 필터: 최근 N일 (매일 실행 기준으로 2일이 적절 — 하루 실패 시 커버 가능) */
const DEFAULT_SINCE_DAYS = 2;

export async function GET(req: Request) {
  // 보안: Vercel Cron 또는 수동 테스트 요청인지 검증
  const authHeader = req.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 날짜 필터 기준 계산
  const sinceDate = resolveSinceDate(req.url);

  const results = {
    sinceDate: sinceDate.toISOString(),
    processed: 0,
    skipped: 0, // URL 중복으로 스킵
    dateSkipped: 0, // 날짜 필터로 스킵 (LLM 호출 없음)
    failed: 0,
    errors: [] as string[],
  };

  for (const feed of RSS_FEEDS) {
    const items = await parseFeed(feed.url);

    if (items.length === 0) {
      console.warn(`[fetch-news] 피드 아이템 없음: ${feed.source}`);
      continue;
    }

    for (const item of items) {
      // 날짜 필터: sinceDate 이전 기사는 LLM 호출 없이 스킵
      if (item.publishedAt < sinceDate) {
        results.dateSkipped++;
        continue;
      }

      try {
        // URL 중복 체크: 이미 저장된 기사는 스킵
        const { data: existing } = await supabase
          .from('tech_news')
          .select('id')
          .eq('original_url', item.link)
          .maybeSingle();

        if (existing) {
          results.skipped++;
          continue;
        }

        // description이 없는 경우 제목만으로 처리
        const descriptionText = item.description || item.title;

        // GPT-4o-mini로 요약 생성 (기사 간 1초 딜레이로 rate limit 방지)
        const content = await summarizeToMarkdown(item.title, descriptionText);

        // Supabase에 저장
        const { error: insertError } = await supabase.from('tech_news').insert({
          title: item.title,
          original_url: item.link,
          content,
          source: feed.source,
          published_at: item.publishedAt.toISOString(),
        });

        if (insertError) {
          throw insertError;
        }

        results.processed++;

        // 기사 간 1초 딜레이: OpenAI rate limit 방지
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed++;
        const message = error instanceof Error ? error.message : String(error);
        results.errors.push(`[${feed.source}] ${item.title}: ${message}`);
        console.error(`[fetch-news] 실패:`, error);
      }
    }
  }

  console.warn('[fetch-news] 완료:', JSON.stringify(results));

  return NextResponse.json({
    message: `완료: ${results.processed}개 저장, ${results.skipped}개 URL중복, ${results.dateSkipped}개 날짜필터, ${results.failed}개 실패`,
    ...results,
  });
}

/**
 * 요청 URL의 쿼리 파라미터로부터 날짜 필터 기준을 계산한다.
 *
 * 우선순위:
 *   1. ?since=YYYY-MM-DD  — 명시적 날짜 지정
 *   2. ?days=N            — N일 전 기준
 *   3. 기본값             — DEFAULT_SINCE_DAYS일 전
 */
function resolveSinceDate(url: string): Date {
  try {
    const { searchParams } = new URL(url);

    // 1. ?since=YYYY-MM-DD
    const sinceParam = searchParams.get('since');
    if (sinceParam) {
      const parsed = new Date(sinceParam);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    // 2. ?days=N
    const daysParam = searchParams.get('days');
    if (daysParam) {
      const days = parseInt(daysParam, 10);
      if (!isNaN(days) && days > 0) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
      }
    }
  } catch {
    // URL 파싱 실패 시 기본값 사용
  }

  // 3. 기본값: 최근 DEFAULT_SINCE_DAYS일
  const date = new Date();
  date.setDate(date.getDate() - DEFAULT_SINCE_DAYS);
  return date;
}
