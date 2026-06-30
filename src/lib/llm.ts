/**
 * @file llm.ts
 * @description OpenAI GPT-4o-mini를 이용한 기술 뉴스 요약 유틸리티.
 *              RSS description 텍스트만 입력받아 토큰 사용량을 최소화한다.
 */

import OpenAI from 'openai';

/** LLM 호출 재시도 설정 */
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2000; // 2초 → 4초 → 8초 (지수 백오프)

/**
 * 기사 제목과 설명을 받아 구조화된 마크다운 요약을 반환한다.
 * Rate limit(429) 발생 시 지수 백오프로 최대 MAX_RETRIES회 재시도한다.
 *
 * @param title - RSS 피드에서 추출한 기사 제목
 * @param description - RSS 피드에서 추출한 기사 description (HTML 제거된 순수 텍스트)
 * @returns 마크다운 형식의 요약 문자열
 */
export async function summarizeToMarkdown(title: string, description: string): Promise<string> {
  // 빌드 타임 평가를 방지하기 위해 런타임에서 클라이언트를 초기화한다.
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 512,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              '당신은 프론트엔드 개발자를 위한 기술 뉴스 큐레이터입니다. 주어진 기사를 개발자가 핵심을 빠르게 파악할 수 있도록 한국어 마크다운 형식으로 요약합니다.',
          },
          {
            role: 'user',
            content: buildPrompt(title, description),
          },
        ],
      });

      const text = response.choices[0]?.message?.content?.trim();
      return text || '요약을 생성하지 못했습니다.';
    } catch (err) {
      const isRateLimit = err instanceof OpenAI.APIError && err.status === 429;

      // quota exceeded(크레딧 소진)는 재시도해도 의미 없으므로 즉시 실패
      if (isRateLimit) {
        const isQuotaExceeded = String(err.message).includes('exceeded your current quota');
        if (isQuotaExceeded) {
          throw new Error(`OpenAI 크레딧 부족. 플랜 또는 결제 정보를 확인하세요: ${err.message}`);
        }
      }

      // 마지막 시도였으면 그냥 던짐
      if (attempt === MAX_RETRIES) throw err;

      // rate limit이거나 일시적 오류면 지수 백오프 후 재시도
      if (isRateLimit || (err instanceof OpenAI.APIError && err.status >= 500)) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[LLM] ${attempt}/${MAX_RETRIES}회 실패, ${delay}ms 후 재시도...`);
        await sleep(delay);
      } else {
        throw err; // 재시도 불필요한 오류 (4xx 등)
      }
    }
  }

  throw new Error('최대 재시도 횟수 초과');
}

/** ms 단위로 대기 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt(title: string, description: string): string {
  return `아래 기사 정보를 바탕으로 개발자가 핵심을 빠르게 파악할 수 있도록 요약해주세요.

[기사 제목]: ${title}
[기사 요약/설명]: ${description}

아래 섹션 중 기사 내용에 해당하는 항목만 포함하세요.
해당 없는 섹션은 생략하세요.

## 핵심 요약
(한두 문장으로 이 기사가 무엇에 관한 것인지 설명)

## 목적 / 배경
(왜 이 기능/변경이 필요했는지, 해결하려는 문제)

## 주요 변경 사항
(새로 추가되거나 바뀐 내용을 불릿 리스트로. 긍정적 변화는 ✅, 제거되거나 주의가 필요한 변화는 ❌ 표시)

## 기존 방식과의 차이점
(before/after 비교, 또는 이전 버전과 달라진 점. 코드 예시가 있다면 인라인 코드로)

## 적용 대상
(이 변경이 영향을 미치는 사용자/프로젝트 유형)

## 적용 방법 / 마이그레이션
(코드 예시나 마이그레이션 가이드가 있다면 간략히)

규칙:
- 각 섹션은 3줄 이내로 간결하게
- 전문 용어는 영어 원문 유지 (예: Server Component, hydration)
- 헤딩에 이모지를 사용하지 말 것
- ✅ ❌ 이모지는 변경점이나 예시를 표현할 때만 사용
- 전체 분량은 최대 300토큰 이내`;
}
