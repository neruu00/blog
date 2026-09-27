/**
 * @file analytics.ts
 * @description GA4 커스텀 이벤트 전송 함수.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4 이벤트를 보낸다. GA 스크립트가 아직 로드되지 않았으면 아무것도 하지 않는다. */
function sendEvent(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

export function trackPostView(postId: string, title: string) {
  sendEvent('post_view', { post_id: postId, post_title: title });
}

export function trackCommentCreate(postId: string) {
  sendEvent('comment_create', { post_id: postId });
}

export function trackCommentDelete(postId: string) {
  sendEvent('comment_delete', { post_id: postId });
}
