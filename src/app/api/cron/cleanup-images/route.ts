/**
 * @file route.ts
 * @description 이미지 정리 크론. 업로드 후 24시간이 지나도 게시글에 연결되지 않은 이미지를
 *              스토리지와 images 테이블에서 지운다.
 */

import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data: orphanImages, error: fetchError } = await supabase
      .from('images')
      .select('id, url')
      .eq('is_used', false)
      .lte('created_at', yesterday.toISOString());

    if (fetchError) throw fetchError;
    if (!orphanImages || orphanImages.length === 0) {
      return NextResponse.json({ message: '청소할 이미지가 없습니다.' });
    }

    // 스토리지를 먼저 지운다. 실패하면 DB 레코드가 남아 다음 실행 때 다시 시도한다.
    const fileNames = orphanImages.map((img) => img.url.split('/').pop()!);
    const { error: storageError } = await supabase.storage.from('images').remove(fileNames);

    if (storageError) throw storageError;

    const idsToDelete = orphanImages.map((img) => img.id);
    await supabase.from('images').delete().in('id', idsToDelete);

    return NextResponse.json({
      message: `성공적으로 ${orphanImages.length}개의 고아 이미지를 삭제했습니다.`,
    });
  } catch (error) {
    console.error('크론 작업 실패:', error);
    return NextResponse.json({ error: '청소 실패' }, { status: 500 });
  }
}
