/**
 * @file analytics.ts
 * @description Google Analytics 커스텀 이벤트 전송 유틸리티.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

/**
 * GA4 커스텀 이벤트 전송
 * - window.gtag가 없으면 (GA 미로드) 무시
 */
function sendEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/** 게시글 조회 이벤트 */
export function trackPostView(postId: string, title: string) {
  sendEvent('post_view', { post_id: postId, post_title: title });
}

/** 좋아요 토글 이벤트 */
export function trackLikeToggle(postId: string, liked: boolean) {
  sendEvent('like_toggle', { post_id: postId, liked });
}

/** 댓글 작성 이벤트 */
export function trackCommentCreate(postId: string) {
  sendEvent('comment_create', { post_id: postId });
}

/** 댓글 삭제 이벤트 */
export function trackCommentDelete(postId: string) {
  sendEvent('comment_delete', { post_id: postId });
}
