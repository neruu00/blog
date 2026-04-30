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
 * @param postId 게시글 ID
 * @param shouldLike 반영하고자 하는 최종 좋아요 상태 (true: 좋아요, false: 좋아요 취소)
 */
export async function toggleLike(postId: string, shouldLike: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    if (shouldLike) {
      // 좋아요 추가 (이미 존재할 경우 에러가 발생할 수 있으므로, 실제 서비스에서는 upsert나 존재 확인 후 처리가 권장됨)
      // 여기서는 클라이언트의 직렬화된 요청을 신뢰하여 단순 insert 수행
      const { error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: session.user.id });

      if (error) {
        // 이미 좋아요가 되어 있는 경우(23505)는 성공으로 간주하거나 무시할 수 있음
        if (error.code === '23505') {
          return { success: true };
        }
        throw error;
      }

      // 비정규화된 like_count 갱신
      const { error: rpcError } = await supabase.rpc('increment_like_count', {
        target_post_id: postId,
      });
      if (rpcError) throw rpcError;
    } else {
      // 좋아요 삭제
      const { data, error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .select();

      if (error) throw error;

      // 실제로 삭제된 데이터가 있는 경우에만 카운트 감소 (멱등성 보장)
      if (data && data.length > 0) {
        const { error: rpcError } = await supabase.rpc('decrement_like_count', {
          target_post_id: postId,
        });
        if (rpcError) throw rpcError;
      }
    }

    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error('좋아요 토글 에러:', error);
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}
