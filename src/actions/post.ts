'use server';

import { revalidatePath } from 'next/cache';

import { verifyAdminSession } from '@/lib/auth';
import extractImageUrlsFromTiptap from '@/lib/extractImageUrlsFromTiptap';
import { supabase } from '@/lib/supabase';

/**
 * SECTION - 게시글 생성
 */
export async function createPost(formData: FormData) {
  if (!(await verifyAdminSession())) return { success: false, error: '권한이 유효하지 않습니다.' };

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;

  if (!title || !content) {
    return { success: false, error: '제목과 내용을 모두 입력해주세요.' };
  }

  let tags: string[] = [];
  try {
    tags = tagsString ? JSON.parse(tagsString) : [];
  } catch (e) {
    return { success: false, error: '태그 형식이 잘못되었습니다.' };
  }

  const body = {
    title,
    content,
    author: 'admin',
    tags,
  };

  try {
    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert([body])
      .select()
      .single();

    if (postError) throw postError;

    const paresedContent = JSON.parse(content);
    const usedImageUrls = extractImageUrlsFromTiptap(paresedContent);

    if (usedImageUrls.length > 0) {
      const { error: imageError } = await supabase
        .from('images')
        .update({ is_used: true, post_id: newPost.id })
        .in('url', usedImageUrls);

      if (imageError) {
        await supabase.from('posts').delete().eq('id', newPost.id);
        throw imageError;
      }
    }

    revalidatePath('/posts');
    return { success: true, postId: newPost.id };
  } catch (err) {
    return { success: false, error: '게시글 저장에 실패했습니다.' };
  }
}
// !SECTION - 게시글 생성

/**
 * SECTION - 게시글 수정
 */
export async function updatePost(
  formData: FormData,
): Promise<{ success: true; postId: string } | { success: false; error: string }> {
  if (!(await verifyAdminSession())) return { success: false, error: '권한이 유효하지 않습니다.' };

  const postId = formData.get('postId') as string;
  const title = formData.get('title') as string;
  const contentString = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;

  let tags: string[] = [];
  try {
    tags = tagsString ? JSON.parse(tagsString) : [];
  } catch (e) {
    return { success: false, error: '태그 형식이 잘못되었습니다.' };
  }

  if (!postId || !title || !contentString) {
    return { success: false, error: '필수 항목이 누락되었습니다.' };
  }

  try {
    const contentJSON = JSON.parse(contentString);
    const currentUrls = extractImageUrlsFromTiptap(contentJSON);

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
      .update({ title, content: contentJSON, tags })
      .eq('id', postId);

    if (updateError) {
      if (addedUrls.length > 0) {
        await supabase
          .from('images')
          .update({ is_used: false, post_id: null })
          .in('url', addedUrls);
      }
      throw updateError;
    }

    if (removedImages.length > 0) {
      const removedUrls = removedImages.map((img) => img.url);

      const { error: orphanError } = await supabase
        .from('images')
        .update({ is_used: false, post_id: null })
        .in('url', removedUrls);

      if (orphanError) {
        console.warn('고아 상태 전환 실패, 직접 삭제(플랜 B)를 시도합니다:', orphanError);

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

    return { success: true, postId };
  } catch (err) {
    console.error('게시글 수정 에러:', err);
    return { success: false, error: '게시글 수정에 실패했습니다.' };
  }
}
// !SECTION - 게시글 수정

/**
 * SECTION - 게시글 삭제
 */
export async function deletePost(postId: string) {
  // 1. 관리자 권한(쿠키) 검증
  if (!(await verifyAdminSession())) return { success: false, error: '권한이 유효하지 않습니다.' };

  try {
    // 2. 삭제할 게시글에 속한 이미지 URL들을 DB에서 조회
    const { data: images } = await supabase.from('images').select('url').eq('post_id', postId);

    // 3. Supabase Storage에서 실제 이미지 파일들 삭제
    if (images && images.length > 0) {
      const fileNames = images.map((img) => img.url.split('/').pop()!);
      const { error: storageError } = await supabase.storage.from('images').remove(fileNames);

      if (storageError) console.error('스토리지 파일 삭제 실패:', storageError);
    }

    // 4. DB에서 게시글 삭제 (ON DELETE CASCADE로 인해 images 테이블 기록도 자동 삭제됨)
    const { error: dbError } = await supabase.from('posts').delete().eq('id', postId);

    if (dbError) throw dbError;

    // 5. 캐시 초기화 (목록 페이지와 메인 페이지 갱신)
    revalidatePath('/posts');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('게시글 삭제 에러:', error);
    return { success: false, error: '게시글 삭제에 실패했습니다.' };
  }
}
// !SECTION - 게시글 삭제
