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
