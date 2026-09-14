/**
 * @file FeatureCarousel.tsx
 * @description 프로젝트의 화면(캡처·영상)을 한 칸씩 넘겨 보는 캐러셀.
 *
 *              라이브러리를 쓰지 않는다: CSS scroll-snap이 스와이프·트랙패드·키보드 스크롤을
 *              모두 처리한다. JS가 더하는 건 세 가지뿐이다 —
 *              (1) 마우스 드래그를 스크롤로 옮기고,
 *              (2) 지금 몇 번째 칸인지 읽고,
 *              (3) 그 칸의 설명으로 캡션을 페이드 전환한다.
 *
 *              캡션은 트랙 밖에 있다 — 화면만 넘어가고 글은 제자리에서 바뀌어야
 *              읽던 위치가 흔들리지 않는다.
 *
 *              영상은 보이는 칸 하나만 재생한다 — 여섯 개가 동시에 디코딩되면 그것만으로 페이지가 느려진다.
 *              캡처는 4:3, 랜딩은 와이드라 칸 비율을 3:2로 고정하고 object-contain으로 담는다.
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import type { Feature, Media } from '@/lib/constants/portfolio';
import { cn } from '@/lib/utils';

interface FeatureCarouselProps {
  /** media가 있는 항목만 칸이 된다 */
  features: Feature[];
  /** 스크린리더가 이 캐러셀이 무엇의 화면인지 알 수 있도록 */
  projectName: string;
}

interface SlideMediaProps {
  media: Media;
  active: boolean;
  /** 모션을 끈 사용자에겐 자동재생 대신 재생 컨트롤을 준다 */
  reducedMotion: boolean;
}

function SlideMedia({ media, active, reducedMotion }: SlideMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;

    if (active) {
      // 사용자 제스처 없이 부르면 브라우저가 거절할 수 있다. muted라 보통 통과하지만 실패해도 무시한다
      void video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active, reducedMotion]);

  /**
   * 실패해도 ready로 올린다 — 영영 도는 스피너보다 깨진 이미지 아이콘이 정직하다.
   * 미디어 위에 덮지 않고 뒤에 깔아둔다: 로드되면 미디어가 자연히 가린다.
   */
  const done = () => setReady(true);

  // 끌어서 넘기는 동작이므로 브라우저 기본 드래그(고스트 이미지)를 막는다
  const element =
    media.kind === 'image' ? (
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 1024px) 768px, 100vw"
        draggable={false}
        onLoad={done}
        onError={done}
        className="relative h-full w-full object-contain"
      />
    ) : (
      <video
        ref={videoRef}
        src={media.src}
        aria-label={media.alt}
        width={media.width}
        height={media.height}
        muted
        loop
        playsInline
        controls={reducedMotion}
        // 넘기기 전까지는 메타데이터만 받는다 — 여섯 개를 미리 받으면 캐러셀이 무거워진다
        preload="metadata"
        draggable={false}
        // 첫 프레임이 그려지는 시점. loadedmetadata는 아직 화면이 비어 있어 이르다
        onLoadedData={done}
        onError={done}
        className="relative h-full w-full object-contain"
      />
    );

  return (
    <>
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner label={`${media.alt} 불러오는 중`} />
        </div>
      )}
      {element}
    </>
  );
}

export default function FeatureCarousel({ features, projectName }: FeatureCarouselProps) {
  // 술어로 좁혀야 아래에서 media에 ! 를 붙이지 않는다
  const slides = features.filter((feature): feature is Feature & { media: Media } =>
    Boolean(feature.media),
  );

  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /** 드래그 시작 지점 — 리렌더를 부르지 않도록 ref에 둔다 */
  const dragStart = useRef<{ x: number; scrollLeft: number } | null>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /**
   * 칸 위치는 실제 li의 offsetLeft로 읽는다.
   * clientWidth에 인덱스를 곱하면 gap이 빠져 뒤로 갈수록 한 칸당 gap만큼 어긋난다.
   * 트랙이 position:relative라 offsetLeft가 곧 목표 scrollLeft다.
   */
  const nearestIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;

    const items = Array.from(track.children) as HTMLElement[];
    let nearest = 0;
    let shortest = Infinity;

    items.forEach((item, i) => {
      const distance = Math.abs(item.offsetLeft - track.scrollLeft);
      if (distance < shortest) {
        shortest = distance;
        nearest = i;
      }
    });

    return nearest;
  }, []);

  const handleScroll = useCallback(() => setIndex(nearestIndex()), [nearestIndex]);

  const goTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      const item = track?.children[next] as HTMLElement | undefined;
      if (!track || !item) return;

      track.scrollTo({ left: item.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [reducedMotion],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    // 터치·펜은 브라우저 기본 스크롤이 이미 자연스럽다. 마우스 왼쪽 버튼만 가로챈다
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    const track = trackRef.current;
    if (!track) return;

    track.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, scrollLeft: track.scrollLeft };
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    const start = dragStart.current;
    const track = trackRef.current;
    if (!start || !track) return;

    // 드래그 중엔 snap을 꺼둔다(아래 className) — 켜둔 채 scrollLeft를 밀면 칸마다 튄다
    track.scrollLeft = start.scrollLeft - (event.clientX - start.x);
  };

  const endDrag = (event: React.PointerEvent<HTMLUListElement>) => {
    const track = trackRef.current;
    if (!dragStart.current || !track) return;

    dragStart.current = null;
    setDragging(false);
    track.releasePointerCapture(event.pointerId);

    // snap이 돌아오기 전에 직접 가장 가까운 칸으로 세운다
    goTo(nearestIndex());
  };

  if (slides.length === 0) return null;

  return (
    <div
      role="group"
      aria-roledescription="캐러셀"
      aria-label={`${projectName} 화면`}
      className="relative mt-6"
    >
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          // relative여야 li의 offsetLeft가 트랙 기준이 된다 — nearestIndex 계산의 전제다
          'no-scrollbar relative flex gap-6 overflow-x-auto',
          dragging ? 'cursor-grabbing snap-none select-none' : 'cursor-grab snap-x snap-mandatory',
        )}
      >
        {slides.map((slide, i) => (
          <li
            key={slide.title}
            role="group"
            aria-roledescription="슬라이드"
            aria-label={`${i + 1} / ${slides.length}: ${slide.title}`}
            className="w-full shrink-0 snap-start"
          >
            <div className="relative flex aspect-3/2 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <SlideMedia media={slide.media} active={i === index} reducedMotion={reducedMotion} />
            </div>
          </li>
        ))}
      </ul>

      {/* 한 칸뿐이면 넘길 곳이 없다 — 눌리지 않는 화살표와 점 하나는 조작할 수 있다는 거짓말이다 */}
      {slides.length > 1 && (
        /* 점은 이동 수단이자 전체 개수 표시다. 트랙과 같은 3:2 상자를 겹쳐 깔아
           화면 칸의 아래쪽에 정확히 붙인다 */
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-3/2">
          {/* 화살표는 화면 칸의 세로 중앙 양옆에 띄운다.
              점과 같은 처리(반투명 흰 배경 + 그림자) — 캡처 위에 떠 있는 요소라 같은 규칙을 따른다.

              인터랙션은 FAB·EditorActions의 원형 플로팅 버튼과 같은 어휘다:
              hover에 뜨고(그림자 강화) 누르면 들어간다(scale-95).
              다만 세로 중앙 고정이라 위로 띄우는 대신 '갈 방향으로' 밀어 방향을 함께 알린다.
              끝 칸에서는 이동·그림자를 되돌린다 — 눌리지 않는 버튼이 반응하면 거짓말이 된다 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="이전 화면"
            className="pointer-events-auto absolute top-1/2 left-3 -translate-y-1/2 rounded-full border-transparent bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-x-0.5 hover:bg-white hover:shadow-md active:scale-95 disabled:translate-x-0 disabled:shadow-sm disabled:hover:bg-white/85"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => goTo(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="다음 화면"
            className="pointer-events-auto absolute top-1/2 right-3 -translate-y-1/2 rounded-full border-transparent bg-white/85 shadow-sm backdrop-blur-sm transition-all duration-200 hover:translate-x-0.5 hover:bg-white hover:shadow-md active:scale-95 disabled:translate-x-0 disabled:shadow-sm disabled:hover:bg-white/85"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            {/* 캡처 위에 떠 있는 요소라 배경과 그림자를 준다 — 밝은 화면에서 점이 묻힌다 */}
            <div className="pointer-events-auto flex gap-2 rounded-full bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm">
              {slides.map((slide, i) => (
                <button
                  key={slide.title}
                  onClick={() => goTo(i)}
                  aria-label={`${i + 1}번째 화면: ${slide.title}`}
                  aria-current={i === index}
                  // 공용 Button을 쓰지 않는 예외 — size가 전부 h-9 고정이라 6px 알약과 맞지 않는다
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-300 hover:bg-gray-400',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 캡션은 한 자리에 겹쳐 쌓고 활성만 보여준다.
          타이머로 갈아끼우지 않는 이유: 전부 깔려 있어야 높이가 가장 긴 글에 맞춰 고정되고,
          글이 바뀔 때 아래 내용이 밀리지 않는다 */}
      <div className="mt-4 grid">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            aria-hidden={i !== index}
            className={cn(
              'col-start-1 row-start-1 transition-opacity duration-300',
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <h5 className="text-base font-semibold text-gray-900">{slide.title}</h5>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{slide.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
