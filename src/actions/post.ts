'use server';

import { revalidatePath } from 'next/cache';

import { verifyAdminSession } from '@/lib/auth';
import extractImageUrlsFromTiptap from '@/lib/extractImageUrlsFromTiptap';
import { supabase } from '@/lib/supabase';

export async function createPost(formData: FormData) {
  if (await verifyAdminSession()) return { success: false, error: '권한이 유효하지 않습니다.' };

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

      if (imageError) throw imageError;
    }

    // 새 글이 생겼으니 목록 페이지 캐시 날리기
    revalidatePath('/posts');

    return { success: true, postId: newPost.id };
  } catch (err) {
    console.error('DB 저장 에러:', err);
    return { success: false, error: '게시글 저장에 실패했습니다.' };
  }
}

export async function updatePost(
  formData: FormData,
): Promise<{ success: true; postId: string } | { success: false; error: string }> {
  if (await verifyAdminSession()) return { success: false, error: '권한이 유효하지 않습니다.' };

  const postId = formData.get('postId') as string;
  const title = formData.get('title') as string;
  const contentString = formData.get('content') as string;
  const tagsString = formData.get('tags') as string;
  const tags = tagsString ? JSON.parse(tagsString) : [];

  if (!postId || !title || !contentString) {
    return { success: false, error: '필수 항목이 누락되었습니다.' };
  }

  try {
    const contentJSON = JSON.parse(contentString);

    // 1. 현재 폼에서(수정 후) 사용된 이미지 URL 추출
    const currentUrls = extractImageUrlsFromTiptap(contentJSON);

    // 2. DB에 기록된 기존(수정 전) 이미지 리스트 불러오기
    const { data: previousImages } = await supabase
      .from('images')
      .select('id, url')
      .eq('post_id', postId);

    const previousUrls = previousImages?.map((img) => img.url) || [];

    // 3. 변경점 비교 (제거된 이미지 vs 추가된 이미지)
    const removedImages = previousImages?.filter((img) => !currentUrls.includes(img.url)) || [];
    const addedUrls = currentUrls.filter((url) => !previousUrls.includes(url));

    // 4. 제거된 이미지 DB와 Storage에서 삭제
    if (removedImages.length > 0) {
      const removedUrls = removedImages.map((img) => img.url);
      const fileNames = removedUrls.map((url) => url.split('/').pop()!);

      // Storage에서 제거
      await supabase.storage.from('images').remove(fileNames);

      // DB에서 제거
      const removedIds = removedImages.map((img) => img.id);
      await supabase.from('images').delete().in('id', removedIds);
    }

    // 5. 새로 추가된 이미지는 DB 사용 여부(is_used) 기록
    if (addedUrls.length > 0) {
      await supabase.from('images').update({ is_used: true, post_id: postId }).in('url', addedUrls);
    }

    // 6. 마지막으로 게시글 내용 업데이트
    const { error: updateError } = await supabase
      .from('posts')
      .update({ title, content: contentJSON, tags })
      .eq('id', postId);

    if (updateError) throw updateError;

    // 7. 관련 캐시 초기화
    revalidatePath(`/posts/${postId}`);
    revalidatePath('/posts');
    revalidatePath('/');

    return { success: true, postId };
  } catch (err) {
    console.error('게시글 수정 에러:', err);
    return { success: false, error: '게시글 수정에 실패했습니다.' };
  }
}

export async function deletePost(postId: string) {
  // 1. 관리자 권한(쿠키) 검증
  if (await verifyAdminSession()) return { success: false, error: '권한이 유효하지 않습니다.' };

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
