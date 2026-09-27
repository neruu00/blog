'use server';

/**
 * @file post.ts
 * @description 게시글 생성·수정·삭제와 조회수 증가 서버 액션.
 *              게시글 저장과 함께 본문 이미지의 연결 상태(is_used, post_id)를 맞추고, 실패하면 롤백한다.
 */

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { extractImageUrlsFromTiptap } from '@/lib/utils/tiptap';
import { postSchema } from '@/schemas/post.schema';
import type { ActionResult, PostActionResult } from '@/types/action.type';

/** 게시글을 생성하고 본문에 쓰인 이미지를 새 게시글에 연결한다. */
export async function createPost(formData: FormData): Promise<PostActionResult> {
  if (!(await isAdmin())) return { success: false, error: '관리자 권한이 필요합니다.' };

  const title = formData.get('title') as string;
  const contentString = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;
  const category = (formData.get('category') as string) || 'tech';

  let tags: string[] = [];
  try {
    tags = tagsString ? JSON.parse(tagsString) : [];
  } catch (e) {
    return { success: false, error: '태그 형식이 잘못되었습니다.' };
  }

  const validatedFields = postSchema.safeParse({
    title,
    content: contentString,
    tags,
    category,
  });

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  let content;
  try {
    content = JSON.parse(validatedFields.data.content);
  } catch (e) {
    return { success: false, error: '콘텐츠 형식이 잘못되었습니다.' };
  }

  const body = {
    title: validatedFields.data.title,
    content,
    tags: validatedFields.data.tags,
    category: validatedFields.data.category,
    author: 'admin',
  };

  try {
    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert([body])
      .select()
      .single();

    if (postError) throw postError;

    const usedImageUrls = extractImageUrlsFromTiptap(content);

    if (usedImageUrls.length > 0) {
      const { error: imageError } = await supabase
        .from('images')
        .update({ is_used: true, post_id: newPost.id })
        .in('url', usedImageUrls);

      // 이미지 연결에 실패하면 게시글도 지워 롤백한다
      if (imageError) {
        await supabase.from('posts').delete().eq('id', newPost.id);
        throw imageError;
      }
    }

    revalidatePath('/posts');
    return { success: true, data: { postId: newPost.id } };
  } catch (err) {
    console.error('게시글 생성 중 오류 발생:', err);
    return { success: false, error: '게시글 저장에 실패했습니다.' };
  }
}

/**
 * 게시글을 수정하고 이미지 연결을 본문에 맞춘다.
 * 새로 사용한 이미지는 연결하고, 본문에서 빠진 이미지는 고아 상태로 되돌려 정리 크론이 삭제하게 한다.
 */
export async function updatePost(formData: FormData): Promise<PostActionResult> {
  if (!(await isAdmin())) return { success: false, error: '관리자 권한이 필요합니다.' };

  const postId = formData.get('postId') as string;
  const title = formData.get('title') as string;
  const contentString = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;
  const category = (formData.get('category') as string) || 'tech';

  if (!postId) {
    return { success: false, error: '게시글 ID가 누락되었습니다.' };
  }

  let tags: string[] = [];
  try {
    tags = tagsString ? JSON.parse(tagsString) : [];
  } catch (e) {
    return { success: false, error: '태그 형식이 잘못되었습니다.' };
  }

  const validatedFields = postSchema.safeParse({
    title,
    content: contentString,
    tags,
    category,
  });

  if (!validatedFields.success) {
    return { success: false, error: validatedFields.error.issues[0].message };
  }

  let content;
  try {
    content = JSON.parse(validatedFields.data.content);
  } catch (e) {
    return { success: false, error: '콘텐츠 형식이 잘못되었습니다.' };
  }

  try {
    const currentUrls = extractImageUrlsFromTiptap(content);

    const { data: previousImages, error: fetchError } = await supabase
      .from('images')
      .select('id, url')
      .eq('post_id', postId);

    if (fetchError) throw fetchError;

    const previousUrls = previousImages?.map((img) => img.url) || [];
    const removedImages = previousImages?.filter((img) => !currentUrls.includes(img.url)) || [];
    const addedUrls = currentUrls.filter((url) => !previousUrls.includes(url));

    if (addedUrls.length > 0) {
      const { error: addError } = await supabase
        .from('images')
        .update({ is_used: true, post_id: postId })
        .in('url', addedUrls);

      if (addError) throw addError;
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        title: validatedFields.data.title,
        content,
        tags: validatedFields.data.tags,
        category: validatedFields.data.category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    // 게시글 수정에 실패하면 방금 연결한 이미지를 다시 고아 상태로 되돌린다
    if (updateError) {
      if (addedUrls.length > 0) {
        await supabase
          .from('images')
          .update({ is_used: false, post_id: null })
          .in('url', addedUrls);
      }
      throw updateError;
    }

    // 본문에서 빠진 이미지는 고아 상태로 돌린다
    if (removedImages.length > 0) {
      const removedUrls = removedImages.map((img) => img.url);

      const { error: orphanError } = await supabase
        .from('images')
        .update({ is_used: false, post_id: null })
        .in('url', removedUrls);

      // 고아 상태로 돌리지 못하면 크론이 찾지 못해 스토리지에 남으므로 직접 삭제한다
      if (orphanError) {
        console.warn('고아 상태 전환 실패, 직접 삭제를 시도:', orphanError);

        try {
          const fileNames = removedUrls.map((url) => url.split('/').pop()!);
          await supabase.storage.from('images').remove(fileNames);

          const removedIds = removedImages.map((img) => img.id);
          await supabase.from('images').delete().in('id', removedIds);
        } catch (hardDeleteError) {
          console.error('좀비 이미지 강제 삭제 실패 - 수동 처리 필요 :', hardDeleteError);
        }
      }
    }

    revalidatePath(`/posts/${postId}`);
    revalidatePath('/posts');
    revalidatePath('/');

    return { success: true, data: { postId } };
  } catch (err) {
    console.error('게시글 수정 에러:', err);
    return { success: false, error: '게시글 수정에 실패했습니다.' };
  }
}

/** 게시글을 삭제하고 연결된 이미지를 고아 상태로 돌린다. */
export async function deletePost(postId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { success: false, error: '관리자 권한이 필요합니다.' };

  try {
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('id, url')
      .eq('post_id', postId);

    if (fetchError) throw fetchError;

    const urls = images?.map((img) => img.url) || [];
    let needsHardDelete = false;

    if (urls.length > 0) {
      const { error: orphanError } = await supabase
        .from('images')
        .update({ is_used: false, post_id: null })
        .in('url', urls);

      // 고아 상태로 돌리지 못한 이미지는 게시글을 지운 뒤 직접 삭제한다
      if (orphanError) {
        console.warn('고아 상태 전환 실패, 게시글 삭제 후 직접 삭제를 실행합니다:', orphanError);
        needsHardDelete = true;
      }
    }

    const { error: dbError } = await supabase.from('posts').delete().eq('id', postId);

    // 게시글 삭제에 실패하면 이미지 연결을 원래대로 되돌린다
    if (dbError) {
      if (urls.length > 0 && !needsHardDelete) {
        await supabase.from('images').update({ is_used: true, post_id: postId }).in('url', urls);
      }
      throw dbError;
    }

    // 게시글은 지웠지만 이미지를 고아 상태로 돌리지 못한 경우, 스토리지에 남지 않도록 직접 삭제한다
    if (needsHardDelete && images && images.length > 0) {
      try {
        const urls = images.map((img) => img.url);
        const fileNames = urls.map((url) => url.split('/').pop()!);
        await supabase.storage.from('images').remove(fileNames);

        const imageIds = images.map((img) => img.id);
        await supabase.from('images').delete().in('id', imageIds);
      } catch (hardDeleteError) {
        console.error('좀비 이미지 강제 삭제 최종 실패 - 수동 확인 필요:', hardDeleteError);
      }
    }

    revalidatePath('/posts');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('게시글 삭제 에러:', error);
    return { success: false, error: '게시글 삭제에 실패했습니다.' };
  }
}

/**
 * 게시글 조회수를 1 올린다.
 * 인증 없이 누구나 호출할 수 있으며, 중복 방지는 클라이언트 쿠키로만 처리한다.
 */
export async function incrementViewCount(postId: string): Promise<ActionResult> {
  try {
    const { error } = await supabase.rpc('increment_view_count', { post_id: postId });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('조회수 증가 에러:', err);
    return { success: false, error: '조회수 업데이트 실패' };
  }
}
