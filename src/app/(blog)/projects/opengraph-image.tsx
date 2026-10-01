/**
 * @file opengraph-image.tsx
 * @description /projects 공유 미리보기 이미지(1200×630). 빌드 시점에 한 번 생성된다.
 *              한글이 깨지지 않도록 Pretendard OTF를 받아 쓰고, 받지 못하면 경고만 남기고 기본 폰트로 그린다.
 */

import { ImageResponse } from 'next/og';

import { PROFILE } from '@/lib/constants/portfolio';

export const alt = `${PROFILE.name} · ${PROFILE.title} 포트폴리오`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT_BASE =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static';

type FontOption = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };

/** 폰트 하나를 받는다. 실패하면 null — 폰트 때문에 빌드가 깨지지 않게 한다 */
async function loadFont(file: string, weight: 400 | 700): Promise<FontOption | null> {
  try {
    const res = await fetch(`${FONT_BASE}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { name: 'Pretendard', data: await res.arrayBuffer(), weight, style: 'normal' };
  } catch (error) {
    console.warn(`[opengraph-image] ${file}을 받지 못해 기본 폰트로 그립니다.`, error);
    return null;
  }
}

/** ImageResponse는 CSS 클래스를 받지 못해 인라인 style로만 그린다. 색은 Tailwind 팔레트 값이다 */
export default async function Image() {
  const fonts = (
    await Promise.all([
      loadFont('Pretendard-Regular.otf', 400),
      loadFont('Pretendard-Bold.otf', 700),
    ])
  ).filter((font): font is FontOption => font !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 96px',
          background: '#ffffff',
          fontFamily: fonts.length > 0 ? 'Pretendard' : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 72,
            left: 96,
            width: 64,
            height: 8,
            borderRadius: 4,
            background: '#f97316',
          }}
        />
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, color: '#111827' }}>
          {PROFILE.name}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 12,
            fontSize: 36,
            fontWeight: 700,
            color: '#f97316',
          }}
        >
          {PROFILE.title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 40,
            maxWidth: 960,
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.5,
            color: '#6b7280',
          }}
        >
          {PROFILE.summary}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
