/**
 * @file search.type.ts
 * @description 게시글 검색 미리 보기 타입.
 */

/** 검색 창에 보여줄 게시글 요약. 서버 액션 응답이라 날짜는 ISO 문자열로 받는다 */
export interface PostSearchResult {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  seriesTitle: string | null;
}
