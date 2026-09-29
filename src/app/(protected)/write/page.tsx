/**
 * @file page.tsx
 * @description 새 게시글 작성 페이지. 시리즈 목록을 조회해 에디터에 넘긴다.
 */

import { createPost } from '@/actions/post';
import PostEditor from '@/components/post/PostEditor';
import { getSeriesOptions } from '@/lib/series';

// 동적 API를 쓰지 않아 그대로 두면 빌드 시점에 정적 생성돼 시리즈 목록이 갱신되지 않는다
export const dynamic = 'force-dynamic';

export default async function WritePage() {
  const seriesOptions = await getSeriesOptions();

  return <PostEditor mode="create" seriesOptions={seriesOptions} onSubmit={createPost} />;
}
