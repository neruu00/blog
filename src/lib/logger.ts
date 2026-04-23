/**
 * @file logger.ts
 * @description 구조화된 로깅 유틸리티.
 *              서버에서는 JSON 형태로 출력하여 Vercel Logs에서 검색 가능.
 *              클라이언트에서는 개발 모드에서만 출력, 프로덕션에서는 error만.
 *              ESLint no-console 규칙과 호환되도록 이 모듈을 통해서만 로그 출력.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

/**
 * 구조화된 로그 엔트리를 생성
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
}

/**
 * 서버 환경 여부 판별
 */
function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * 로그를 출력할지 판별 (클라이언트 프로덕션에서는 error만 허용)
 */
function shouldLog(level: LogLevel): boolean {
  if (isServer()) return true;
  if (process.env.NODE_ENV === 'development') return true;
  return level === 'error';
}

export const logger = {
  /**
   * 정보성 로그 출력
   * @param message - 로그 메시지
   * @param meta - 추가 메타데이터 (선택)
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', message, meta);
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  },

  /**
   * 경고 로그 출력
   * @param message - 로그 메시지
   * @param meta - 추가 메타데이터 (선택)
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', message, meta);
    console.warn(JSON.stringify(entry));
  },

  /**
   * 에러 로그 출력
   * @param message - 로그 메시지
   * @param error - 에러 객체 또는 추가 정보 (선택)
   */
  error(message: string, error?: unknown): void {
    if (!shouldLog('error')) return;
    const meta: Record<string, unknown> = {};

    if (error instanceof Error) {
      meta.errorName = error.name;
      meta.errorMessage = error.message;
      meta.stack = error.stack;
    } else if (error !== undefined) {
      meta.error = error;
    }

    const entry = createLogEntry('error', message, Object.keys(meta).length > 0 ? meta : undefined);
    console.error(JSON.stringify(entry));
  },
};
