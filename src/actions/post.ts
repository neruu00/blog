'use server';

import extractImageUrlsFromTiptap from '@/lib/extractImageUrlsFromTiptap';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function createPost(formData: FormData) {
  const session = (await cookies()).get('admin_session');
  if (!session) {
    return { success: false, error: '권한이 없습니다. (쿠키 없음)' };
  }

  try {
    const decodedSecret = Buffer.from(session.value, 'base64').toString('utf8');
    if (decodedSecret !== process.env.SESSION_SECRET) {
      return { success: false, error: '유효하지 않은 세션입니다.' };
    }
  } catch (e) {
    return { success: false, error: '세션 검증 중 오류가 발생했습니다.' };
  }

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

export async function deletePost(postId: string) {
  // 1. 관리자 권한(쿠키) 검증
  const session = (await cookies()).get('admin_session');
  if (!session) return { success: false, error: '권한이 없습니다.' };

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
