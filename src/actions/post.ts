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
  const contentString = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;

  let content;
  try {
    content = JSON.parse(contentString);
  } catch (e) {
    return { success: false, error: '콘텐츠 형식이 잘못되었습니다.' };
  }

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
    tags,
    author: 'admin',
  };

  try {
    // 1. 게시글 데이터 DB에 저장 및 새로 생성된 게시글 ID 가져오기
    const { data: newPost, error: postError } = await supabase
      .from('posts')
      .insert([body])
      .select()
      .single();

    if (postError) throw postError;

    // 2. 이미지 URL 추출 및 이미지 레코드 업데이트
    const usedImageUrls = extractImageUrlsFromTiptap(content);

    if (usedImageUrls.length > 0) {
      const { error: imageError } = await supabase
        .from('images')
        .update({ is_used: true, post_id: newPost.id })
        .in('url', usedImageUrls);

      // FALLBACK: 이미지 레코드 업데이트 실패 시, 게시글도 롤백 처리
      if (imageError) {
        await supabase.from('posts').delete().eq('id', newPost.id);
        throw imageError;
      }
    }

    revalidatePath('/posts');
    return { success: true, postId: newPost.id };
  } catch (err) {
    console.error('게시글 생성 중 오류 발생:', err);
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

  let content;
  try {
    content = JSON.parse(contentString);
  } catch (e) {
    return { success: false, error: '콘텐츠 형식이 잘못되었습니다.' };
  }

  if (!postId || !title || !content) {
    return { success: false, error: '필수 항목이 누락되었습니다.' };
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

    // 2. 새로 추가된 이미지 URL 사용 여부 업데이트, 게시글과 연결
    if (addedUrls.length > 0) {
      const { error: addError } = await supabase
        .from('images')
        .update({ is_used: true, post_id: postId })
        .in('url', addedUrls);

      if (addError) throw addError;
    }

    // 3. 게시글 업데이트
    const { error: updateError } = await supabase
      .from('posts')
      .update({ title, content, tags })
      .eq('id', postId);

    // FALLBACK: 게시글 업데이트 실패 시, 새로 추가된 이미지들은 다시 고아 상태로 롤백 처리
    if (updateError) {
      if (addedUrls.length > 0) {
        await supabase
          .from('images')
          .update({ is_used: false, post_id: null })
          .in('url', addedUrls);
      }
      throw updateError;
    }

    // FALLBACK: 기존에 연결되어 있었지만 현재 콘텐츠에서 제거된 이미지들은 고아 상태로 전환
    if (removedImages.length > 0) {
      const removedUrls = removedImages.map((img) => img.url);

      const { error: orphanError } = await supabase
        .from('images')
        .update({ is_used: false, post_id: null })
        .in('url', removedUrls);

      // FALLBACK: 고아 상태 전환 실패 시, 좀비 이미지 방지를 위해 직접 삭제 시도
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
  if (!(await verifyAdminSession())) return { success: false, error: '권한이 유효하지 않습니다.' };

  try {
    // 1. 게시글에 연결된 이미지 URL 조회
    const { data: images, error: fetchError } = await supabase
      .from('images')
      .select('url')
      .eq('post_id', postId);

    if (fetchError) throw fetchError;

    // 2. 연결된 이미지가 있다면, 먼저 고아 상태로 전환 시도
    const urls = images?.map((img) => img.url) || [];
    let needsHardDelete = false;

    if (urls.length > 0) {
      const { error: orphanError } = await supabase
        .from('images')
        .update({ is_used: false, post_id: null })
        .in('url', urls);

      // 고아 상태 전환 실패 시, 좀비 이미지 방지를 위해 직접 삭제 플래그 설정
      if (orphanError) {
        console.warn('고아 상태 전환 실패, 게시글 삭제 후 직접 삭제를 실행합니다:', orphanError);
        needsHardDelete = true; // 실패 시 하드 딜리트 플래그
      }
    }

    // 3. 게시글 삭제
    const { error: dbError } = await supabase.from('posts').delete().eq('id', postId);

    // FALLBACK: 게시글 삭제 실패 시, 이미지 레코드도 롤백 처리
    if (dbError) {
      if (urls.length > 0 && !needsHardDelete) {
        await supabase.from('images').update({ is_used: true, post_id: postId }).in('url', urls);
      }
      throw dbError;
    }

    // FALLBACK: 게시글 삭제는 성공했지만 이미지 레코드 업데이트가 실패한 경우, 좀비 이미지 방지를 위해 직접 삭제 시도
    if (needsHardDelete && urls.length > 0) {
      try {
        const fileNames = urls.map((url) => url.split('/').pop()!);
        await supabase.storage.from('images').remove(fileNames);
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
// !SECTION - 게시글 삭제
