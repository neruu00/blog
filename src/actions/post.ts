'use server';

/**
 * @file post.ts
 * @description 게시글 생성·수정·삭제와 조회수 증가 서버 액션.
 *              게시글 저장과 함께 본문 이미지의 연결 상태(is_used, post_id)를 맞추고, 실패하면 롤백한다.
 *              시리즈는 이름으로 받아 없으면 만들고, 속한 글이 없어진 시리즈는 지운다.
 */

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { extractImageUrlsFromTiptap } from '@/lib/utils/tiptap';
import { postSchema } from '@/schemas/post.schema';
import type { ActionResult, PostActionResult } from '@/types/action.type';

/** 이름이 같은 시리즈가 있으면 그 id를, 없으면 새로 만들어 id를 반환한다. */
async function findOrCreateSeries(title: string): Promise<string> {
  const { data, error } = await supabase
    .from('series')
    .upsert({ title }, { onConflict: 'title' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/** 시리즈의 마지막 순서 다음 값을 반환한다. `excludePostId`는 순서 계산에서 뺀다. */
async function getNextSeriesOrder(seriesId: string, excludePostId?: string): Promise<number> {
  let query = supabase
    .from('posts')
    .select('series_order')
    .eq('series_id', seriesId)
    .not('series_order', 'is', null);
  if (excludePostId) query = query.neq('id', excludePostId);

  const { data, error } = await query
    .order('series_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data?.series_order ?? 0) + 1;
}

/** 속한 글이 없는 시리즈를 지운다. 실패해도 게시글 작업은 성공으로 두고 로그만 남긴다. */
async function deleteSeriesIfEmpty(seriesId: string) {
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('series_id', seriesId);

  if (error) {
    console.warn('빈 시리즈 확인 실패:', error);
    return;
  }
  if (count !== 0) return;

  const { error: deleteError } = await supabase.from('series').delete().eq('id', seriesId);
  if (deleteError) console.warn('빈 시리즈 삭제 실패:', deleteError);
}

/**
 * 시리즈에 속한 글의 상세 페이지를 모두 갱신한다.
 * 글 하나가 시리즈에 들어오거나 빠지면 같은 시리즈 다른 글의 시리즈 목록과 이전/다음 글도 바뀐다.
 */
async function revalidateSeriesPosts(seriesIds: (string | null)[]) {
  const ids = [...new Set(seriesIds.filter((id): id is string => !!id))];
  if (ids.length === 0) return;

  const { data, error } = await supabase.from('posts').select('id').in('series_id', ids);
  if (error) {
    console.warn('시리즈 글 목록 조회 실패:', error);
    return;
  }
  data.forEach((post) => revalidatePath(`/posts/${post.id}`));
}

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
    seriesTitle: formData.get('seriesTitle') ?? '',
    seriesOrder: formData.get('seriesOrder') || undefined,
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

  const { seriesTitle, seriesOrder } = validatedFields.data;
  let seriesId: string | null = null;

  try {
    if (seriesTitle) seriesId = await findOrCreateSeries(seriesTitle);

    const body = {
      title: validatedFields.data.title,
      content,
      tags: validatedFields.data.tags,
      category: validatedFields.data.category,
      author: 'admin',
      series_id: seriesId,
      series_order: seriesId ? (seriesOrder ?? (await getNextSeriesOrder(seriesId))) : null,
    };

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
    await revalidateSeriesPosts([seriesId]);
    return { success: true, data: { postId: newPost.id } };
  } catch (err) {
    // 이 글을 위해 만든 시리즈가 빈 채로 남지 않게 지운다
    if (seriesId) await deleteSeriesIfEmpty(seriesId);
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
    seriesTitle: formData.get('seriesTitle') ?? '',
    seriesOrder: formData.get('seriesOrder') || undefined,
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

  const { seriesTitle, seriesOrder } = validatedFields.data;
  let seriesId: string | null = null;
  let previousSeriesId: string | null = null;

  try {
    const { data: previousPost, error: previousPostError } = await supabase
      .from('posts')
      .select('series_id, series_order')
      .eq('id', postId)
      .single();

    if (previousPostError) throw previousPostError;
    previousSeriesId = previousPost.series_id;

    if (seriesTitle) seriesId = await findOrCreateSeries(seriesTitle);

    // 순서를 비워 두면 같은 시리즈에 남는 글은 원래 순서를, 새로 들어온 글은 마지막 다음 순서를 받는다
    let nextSeriesOrder: number | null = null;
    if (seriesId) {
      nextSeriesOrder =
        seriesOrder ??
        (seriesId === previousSeriesId && previousPost.series_order !== null
          ? previousPost.series_order
          : await getNextSeriesOrder(seriesId, postId));
    }

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
        series_id: seriesId,
        series_order: nextSeriesOrder,
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

    if (previousSeriesId && previousSeriesId !== seriesId) {
      await deleteSeriesIfEmpty(previousSeriesId);
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
    await revalidateSeriesPosts([previousSeriesId, seriesId]);

    return { success: true, data: { postId } };
  } catch (err) {
    // 이 글을 옮기려고 만든 시리즈가 빈 채로 남지 않게 지운다
    if (seriesId && seriesId !== previousSeriesId) await deleteSeriesIfEmpty(seriesId);
    console.error('게시글 수정 에러:', err);
    return { success: false, error: '게시글 수정에 실패했습니다.' };
  }
}

/** 게시글을 삭제하고 연결된 이미지를 고아 상태로 돌린다. */
export async function deletePost(postId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { success: false, error: '관리자 권한이 필요합니다.' };

  try {
    const [{ data: images, error: fetchError }, { data: post, error: postFetchError }] =
      await Promise.all([
        supabase.from('images').select('id, url').eq('post_id', postId),
        supabase.from('posts').select('series_id').eq('id', postId).maybeSingle(),
      ]);

    if (fetchError) throw fetchError;
    if (postFetchError) throw postFetchError;
    const seriesId: string | null = post?.series_id ?? null;

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

    if (seriesId) {
      await deleteSeriesIfEmpty(seriesId);
      await revalidateSeriesPosts([seriesId]);
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
