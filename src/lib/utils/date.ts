/**
 * @file date.ts
 * @description 날짜 포맷팅 유틸리티.
 */

/**
 * Date 객체나 날짜 문자열을 한국어 날짜 형식으로 포맷팅
 * @param date - 포맷팅할 날짜
 * @returns "2026년 4월 23일" 형식의 문자열
 */
export function formatDateKo(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Date 객체나 날짜 문자열을 상대 시간으로 포맷팅
 * @param date - 포맷팅할 날짜
 * @returns "방금 전", "5분 전", "3일 전" 등의 문자열
 */
export function formatRelativeTime(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return formatDateKo(d);
}
