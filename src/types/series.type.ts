/**
 * @file series.type.ts
 * @description 게시글 시리즈 타입.
 */

/** 에디터의 시리즈 자동완성 항목. `maxOrder`로 새 글의 기본 순서를 미리 보여 준다. */
export interface SeriesOption {
  id: string;
  title: string;
  /** 시리즈에 속한 글 중 가장 큰 series_order. 순서가 매겨진 글이 없으면 0 */
  maxOrder: number;
}

export interface SeriesPost {
  id: string;
  title: string;
}

/** 상세 페이지 시리즈 목록에 넘기는 값. `posts`는 시리즈 안 순서대로 정렬돼 있다. */
export interface PostSeries {
  title: string;
  posts: SeriesPost[];
}
