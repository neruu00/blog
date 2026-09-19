/**
 * @file route.ts
 * @description 저장된 뉴스 원문에서 북마크 카드용 Open Graph 이미지를 찾아 리디렉션한다.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { fetchArticleImage } from '@/lib/article';
import { supabase } from '@/lib/supabase';

interface NewsImageRouteProps {
  params: Promise<{ id: string }>;
}

const idSchema = z.uuid();

export async function GET(_request: Request, { params }: NewsImageRouteProps) {
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) return new Response(null, { status: 404 });

  const { data } = await supabase
    .from('tech_news')
    .select('original_url')
    .eq('id', parsedId.data)
    .single();

  if (!data) return new Response(null, { status: 404 });

  const imageUrl = await fetchArticleImage(data.original_url);
  if (!imageUrl) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'public, s-maxage=3600' },
    });
  }

  return NextResponse.redirect(imageUrl, {
    status: 307,
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  });
}
