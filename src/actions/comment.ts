'use server';

/**
 * @file comment.ts
 * @description 댓글 조회·작성·삭제 서버 액션. 작성은 로그인 사용자, 삭제는 작성자 본인이나 관리자만 할 수 있다.
 */

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { commentSchema, type CommentInput } from '@/schemas/comment.schema';
import type { ActionResult } from '@/types/action.type';
import type { Comment } from '@/types/comment.type';

/** 게시글의 댓글을 작성순으로 가져와 작성자 이름·프로필 이미지를 붙인다. */
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

/** 로그인한 사용자의 댓글을 저장한다. `parentId`가 있으면 대댓글이다. */
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

/** 댓글을 삭제한다. 작성자 본인이나 관리자만 지울 수 있다. */
export async function deleteComment(commentId: string, postId: string): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // RLS가 없으므로 작성자 확인을 여기서 직접 한다
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
