/**
 * @file route.ts
 * @description 기술 뉴스 수집 크론. 매일 UTC 00:00(KST 09:00)에 RSS 피드의 새 기사를 모아
 *              LLM으로 한국어 해설을 만들고 tech_news에 저장한다.
 */

import { NextResponse } from 'next/server';

import { fetchArticleText } from '@/lib/article';
import { summarizeToMarkdown } from '@/lib/llm';
import { parseFeed, RSS_FEEDS, type ParsedFeedItem } from '@/lib/rss';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Vercel 함수 최대 실행 시간(초). Pro 플랜 기준 상한이다.
export const maxDuration = 300;

/** 기본 수집 범위(일). 매일 실행하므로 2일로 두면 한 번 실패해도 빠지는 기사가 없다. */
const DEFAULT_SINCE_DAYS = 2;

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 키가 없으면 모든 기사가 실패하므로 200 대신 500으로 설정 오류를 바로 드러낸다.
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.' },
      { status: 500 },
    );
  }

  const startTime = Date.now();
  const MAX_RUN_TIME = 250000; // maxDuration보다 여유를 둬 응답을 반환할 시간을 남긴다

  const sinceDate = resolveSinceDate(req.url);

  // 기사마다 조회하지 않도록 기존 URL을 한꺼번에 가져온다.
  const { data: existingNews } = await supabase
    .from('tech_news')
    .select('original_url')
    .gte('published_at', sinceDate.toISOString());
  const existingUrls = new Set(existingNews?.map((r) => r.original_url) ?? []);

  const results = {
    sinceDate: sinceDate.toISOString(),
    processed: 0,
    skipped: 0, // URL 중복으로 스킵
    dateSkipped: 0, // 날짜 필터로 스킵 (LLM 호출 없음)
    failed: 0, // 기사 단위 실패
    rssFallback: 0, // 원문 수집 실패 후 RSS 설명으로 생성
    deferred: 0, // 원문 정보 부족으로 게시 보류
    feedsFailed: 0, // 피드 단위 실패 (URL 만료, 네트워크 오류 등)
    deferredItems: [] as string[],
    errors: [] as string[],
  };

  for (const feed of RSS_FEEDS) {
    // 피드 파싱도 오래 걸릴 수 있고, 아이템이 없는 피드는 안쪽 검사에 닿지 않으므로 여기서도 확인한다.
    if (Date.now() - startTime > MAX_RUN_TIME) {
      console.warn('[fetch-news] 최대 실행 시간 초과, 남은 피드 처리를 중단합니다.');
      return NextResponse.json({ ...results, timeout: true });
    }

    let items: ParsedFeedItem[];
    try {
      items = await parseFeed(feed.url);
    } catch (error) {
      // 집계하지 않으면 모든 피드가 실패해도 200과 0건만 응답된다.
      results.feedsFailed++;
      const message = error instanceof Error ? error.message : String(error);
      results.errors.push(`[${feed.source}] 피드 파싱 실패 (${feed.url}): ${message}`);
      console.error(`[fetch-news] 피드 파싱 실패: ${feed.url}`, error);
      continue;
    }

    if (items.length === 0) {
      console.warn(`[fetch-news] 피드 아이템 없음: ${feed.source}`);
      continue;
    }

    for (const item of items) {
      if (Date.now() - startTime > MAX_RUN_TIME) {
        console.warn('[fetch-news] 최대 실행 시간 초과, 남은 피드 처리를 중단합니다.');
        return NextResponse.json({ ...results, timeout: true });
      }

      if (item.publishedAt < sinceDate) {
        results.dateSkipped++;
        continue;
      }

      try {
        if (existingUrls.has(item.link)) {
          results.skipped++;
          continue;
        }

        // RSS 설명은 대개 짧아 원문을 우선한다. 원문 수집에 실패하면 RSS 본문이 충분할 때만 생성해
        // 제목만으로 내용을 추측하지 않게 한다.
        const articleText = await fetchArticleText(item.link);
        const sourceText = articleText ?? item.description;
        if (sourceText.trim().length < 400) {
          results.deferred++;
          results.deferredItems.push(`[${feed.source}] ${item.title}`);
          continue;
        }
        if (!articleText) results.rssFallback++;

        const content = await summarizeToMarkdown(item.title, sourceText);

        const { error: insertError } = await supabase.from('tech_news').insert({
          title: item.title,
          original_url: item.link,
          content,
          source: feed.source,
          published_at: item.publishedAt.toISOString(),
        });

        if (insertError) {
          // original_url UNIQUE 위반은 백필 반복이나 크론 중복 실행으로 생기므로 스킵으로 센다.
          if (insertError.code === '23505') {
            results.skipped++;
          } else {
            throw insertError;
          }
        } else {
          results.processed++;
        }

        // 같은 URL이 다른 피드에 다시 나와도 LLM을 또 호출하지 않게 한다.
        existingUrls.add(item.link);

        // OpenAI rate limit을 피하려고 기사 사이에 1초 쉰다.
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
    message: `완료: ${results.processed}개 저장(${results.rssFallback}개 RSS 대체), ${results.skipped}개 URL중복, ${results.dateSkipped}개 날짜필터, ${results.deferred}개 게시보류, ${results.failed}개 기사실패, ${results.feedsFailed}개 피드실패`,
    ...results,
  });
}

/**
 * 수집 시작 날짜를 정한다. 수동 실행 시 쿼리 파라미터로 범위를 바꿀 수 있다.
 * 우선순위는 `?since=YYYY-MM-DD` → `?days=N` → DEFAULT_SINCE_DAYS다.
 */
function resolveSinceDate(url: string): Date {
  try {
    const { searchParams } = new URL(url);

    const sinceParam = searchParams.get('since');
    if (sinceParam) {
      const parsed = new Date(sinceParam);
      if (!isNaN(parsed.getTime())) return parsed;
    }

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
    // URL을 파싱하지 못하면 기본값을 쓴다.
  }

  const date = new Date();
  date.setDate(date.getDate() - DEFAULT_SINCE_DAYS);
  return date;
}
