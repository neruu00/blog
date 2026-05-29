'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { commentSchema, type CommentInput } from '@/schemas/comment.schema';
import type { ActionResult } from '@/types/action.type';
import type { Comment } from '@/types/comment.type';

/**
 * 게시글의 댓글 목록 조회
 */
export async function getComments(postId: string): Promise<ActionResult<Comment[]>> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    let mappedComments = data;
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: users, error: usersError } = await supabase
        .schema('next_auth')
        .from('users')
        .select('id, name, image')
        .in('id', userIds);

      if (!usersError && users) {
        mappedComments = data.map((c) => ({
          ...c,
          user: users.find((u) => u.id === c.user_id) || null,
        }));
      }
    }

    return { success: true, data: mappedComments };
  } catch (error) {
    console.error('댓글 로드 에러:', error);
    return { success: false, error: '댓글을 불러오지 못했습니다.' };
  }
}

/**
 * 댓글 작성
 */
export async function createComment(input: CommentInput): Promise<ActionResult<Comment>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    const validatedFields = commentSchema.safeParse(input);
    if (!validatedFields.success) {
      return { success: false, error: validatedFields.error.issues[0].message };
    }

    const { postId, content, parentId } = validatedFields.data;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: session.user.id,
        parent_id: parentId,
        content,
      })
      .select('*')
      .single();

    if (error) throw error;

    // 세션 정보를 기반으로 user 객체 덧붙이기
    const newComment = {
      ...data,
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      },
    };

    revalidatePath(`/posts/${postId}`);
    return { success: true, data: newComment };
  } catch (error) {
    console.error('댓글 작성 에러:', error);
    return { success: false, error: '댓글을 작성하지 못했습니다.' };
  }
}

/**
 * 댓글 삭제
 */
export async function deleteComment(commentId: string, postId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 본인 댓글이거나 어드민인지 체크 (DB 수준의 RLS가 설정되어 있다면 더 안전)
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return { success: false, error: '댓글을 찾을 수 없습니다.' };
    }

    const isAdmin = session.user.isAdmin;

    if (comment.user_id !== session.user.id && !isAdmin) {
      return { success: false, error: '삭제 권한이 없습니다.' };
    }

    const { error: deleteError } = await supabase.from('comments').delete().eq('id', commentId);

    if (deleteError) throw deleteError;

    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error('댓글 삭제 에러:', error);
    return { success: false, error: '댓글 삭제에 실패했습니다.' };
  }
}
