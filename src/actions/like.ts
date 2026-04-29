'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * 특정 게시글의 유저 좋아요 상태 확인 및 좋아요 개수 조회
 */
export async function getLikeStatus(postId: string) {
  try {
    const session = await getServerSession(authOptions);

    // 좋아요 총 개수 조회
    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (countError) throw countError;

    let hasLiked = false;

    // 로그인한 유저라면 자신의 좋아요 여부 확인
    if (session?.user?.id) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .single();

      // 찾으면 hasLiked = true, 못 찾으면 error (PGRST116) 발생
      if (data) hasLiked = true;
    }

    return { success: true, count: count || 0, hasLiked };
  } catch (error) {
    console.error('좋아요 상태 로드 에러:', error);
    return { success: false, error: '좋아요 상태를 불러오지 못했습니다.' };
  }
}

/**
 * 좋아요 토글 액션 (낙관적 업데이트용)
 */
export async function toggleLike(postId: string, currentHasLiked: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    if (currentHasLiked) {
      // 이미 좋아요 한 상태라면 삭제
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // 비정규화된 like_count 갱신
      await supabase.rpc('decrement_like_count', { target_post_id: postId });
    } else {
      // 좋아요 추가
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id });

      if (error) throw error;

      // 비정규화된 like_count 갱신
      await supabase.rpc('increment_like_count', { target_post_id: postId });
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error('좋아요 토글 에러:', error);
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}
