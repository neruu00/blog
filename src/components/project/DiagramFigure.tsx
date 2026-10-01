/**
 * @file DiagramFigure.tsx
 * @description 포트폴리오의 mermaid 도표와 캡션. 도표는 들어간 테두리 액자 안에 넣고, 그리기는 클라이언트 리프인 MermaidDiagram이 맡는다.
 */

import MermaidDiagram from '@/components/editor/extensions/MermaidDiagram';
import type { DiagramVisual } from '@/lib/constants/portfolio';

/**
 * 도표를 포트폴리오 화면의 팔레트와 픽셀 폰트(Galmuri11)에 맞추는 mermaid 테마 지시문. 코드 앞에 붙여 이 도표에만 적용한다.
 * mermaid는 CSS 클래스를 받지 못해 Tailwind 팔레트 값(orange-50/500, gray-50/100/200/500/700/900)을
 * hex로 직접 적는다. 임의 hex 금지 규칙의 예외다.
 */
const THEME_INIT =
  '%%{init: {"theme":"base","sequence":{"mirrorActors":false},"themeVariables":{"fontFamily":"Galmuri11, Pretendard Variable, sans-serif","fontSize":"12px","primaryColor":"#fff7ed","primaryTextColor":"#111827","primaryBorderColor":"#f97316","lineColor":"#6b7280","secondaryColor":"#f9fafb","tertiaryColor":"#f3f4f6","noteBkgColor":"#f9fafb","noteBorderColor":"#e5e7eb","actorBkg":"#fff7ed","actorBorder":"#f97316","signalColor":"#374151","labelBoxBkgColor":"#f9fafb","labelBoxBorderColor":"#e5e7eb"}}}%%';

interface DiagramFigureProps {
  visual: DiagramVisual;
}

export default function DiagramFigure({ visual }: DiagramFigureProps) {
  return (
    <figure>
      <div className="win-sunken bg-white p-3">
        <MermaidDiagram code={`${THEME_INIT}\n${visual.code}`} />
      </div>
      <figcaption className="mt-2 text-gray-500">{visual.caption}</figcaption>
    </figure>
  );
}
