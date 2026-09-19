/**
 * @file llm.ts
 * @description OpenAI GPT-4o-mini를 이용해 기술 뉴스 원문을 한국어 해설로 정리한다.
 */

import OpenAI from 'openai';

/** LLM 호출 재시도 설정 */
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2000; // 2초 → 4초 → 8초 (지수 백오프)

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    // 빌드 타임 평가를 방지하기 위해 최초 호출 시에만 초기화한다.
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * 기사 제목과 원문을 받아 구조화된 마크다운 해설을 반환한다.
 * Rate limit(429) 발생 시 지수 백오프로 최대 MAX_RETRIES회 재시도한다.
 *
 * @param title - RSS 피드에서 추출한 기사 제목
 * @param sourceText - 원문에서 추출한 본문 또는 충분한 길이의 RSS 설명
 * @returns 마크다운 형식의 요약 문자열
 */
export async function summarizeToMarkdown(title: string, sourceText: string): Promise<string> {
  const openai = getOpenAIClient();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              '당신은 프론트엔드 개발자를 위한 기술 뉴스 해설자입니다. 원문에 근거해 정확하고 이해하기 쉬운 한국어 글을 작성합니다. 원문의 사실과 일반적인 배경 설명을 구분하고, 확인할 수 없는 수치·지원 범위·API·폐기 여부를 추측하지 않습니다.',
          },
          {
            role: 'user',
            content: buildPrompt(title, sourceText),
          },
        ],
      });

      const choice = response.choices[0];
      const text = choice?.message?.content?.trim();
      if (!text) throw new Error('LLM이 빈 요약을 반환했습니다.');
      if (choice.finish_reason === 'length')
        throw new Error('LLM 출력이 토큰 제한으로 잘렸습니다.');
      const overviewIndex = text.search(/^## 개요\s*$/m);
      const explanationIndex = text.search(/^## 설명\s*$/m);
      if (overviewIndex < 0 || explanationIndex <= overviewIndex) {
        throw new Error('LLM 출력에 필수 섹션(개요, 설명)이 없습니다.');
      }
      return text;
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

function buildPrompt(title: string, sourceText: string): string {
  return `아래 원문을 바탕으로, 이 글만 읽어도 원문이 전하는 변화와 의미를 대략 이해할 수 있는 한국어 해설을 작성해주세요.

[기사 제목]: ${title}
[원문]:
${sourceText}

반드시 아래 두 개의 최상위 섹션만 이 순서로 사용하세요.

## 개요
무엇이 발표되거나 바뀌었는지, 왜 필요한지, 누구에게 어떤 의미가 있는지를 2~4개 문단으로 연결해 설명하세요. 이 섹션만 읽어도 뉴스의 핵심을 이해할 수 있어야 합니다.

## 설명
개요를 반복하지 말고 동작 원리, 구체적인 사용 상황, 변경의 영향과 주의점을 이해하기 쉽게 풀어주세요. 내용에 맞는 ### 소제목을 자유롭게 사용하세요.

작성 기준:
- 원문 전체를 번역하거나 주제 전체를 다루는 튜토리얼로 확장하지 말고, 이 뉴스가 전하는 변화와 의미에 집중하세요.
- 새 방식이 기존 방식을 대체하는지, 보완하는지, 선택지로 추가되는지 먼저 구분하세요. 차이가 있다면 같은 작업을 각각 어떻게 처리하는지 구체적으로 비교하세요.
- 비교할 근거가 없거나 비교 대상이 없는 기사에는 전후 비교를 억지로 만들지 마세요.
- 버전, 성능 수치, 지원 범위, API, 마이그레이션 필요성은 원문에서 확인되는 내용만 단정하세요.
- 이해에 필요한 일반 배경지식은 설명할 수 있지만, 이번 발표에서 새로 생긴 사실처럼 표현하지 마세요.
- 코드가 이해에 실질적으로 도움이 될 때만 언어가 지정된 짧은 Markdown 코드 블록을 사용하세요. 새로 구성한 코드는 '설명용 예시'라고 밝히세요.
- 처리 흐름이나 구조적 관계가 글보다 명확해질 때만 \`mermaid\` 코드 블록을 사용하세요. 단순 목록을 도식으로 만들지 마세요.
- 전문 용어는 영어 원문을 유지하고 처음 등장할 때 필요한 만큼만 풀이하세요.
- 헤딩과 본문에 이모지를 사용하지 마세요.
- 원문 정보가 적으면 짧게 작성하세요. 분량을 채우려고 추측하거나 같은 내용을 반복하지 마세요.
- 일반적으로 1,200~2,000토큰을 목표로 하되, 내용상 필요할 때만 최대 4,000토큰까지 작성하세요.`;
}
