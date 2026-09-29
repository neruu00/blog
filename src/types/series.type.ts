/**
 * @file series.type.ts
 * @description 게시글 시리즈 타입.
 */

export interface SeriesPost {
  id: string;
  title: string;
}

/** 에디터 시리즈 다이얼로그의 선택지. `posts`는 시리즈 안 순서대로 정렬돼 있다. */
export interface SeriesOption {
  id: string;
  title: string;
  posts: SeriesPost[];
}

/** 상세 페이지 시리즈 목록에 넘기는 값. `posts`는 시리즈 안 순서대로 정렬돼 있다. */
export interface PostSeries {
  title: string;
  posts: SeriesPost[];
}

/**
 * 이 글을 시리즈 안 어디에 둘지. 글을 저장할 때 반영한다.
 * `null`이면 새로 들어온 글은 맨 끝, 원래 있던 글은 제자리에 둔다.
 */
export type SeriesPlacement = null | { after: 'first' } | { after: string };
