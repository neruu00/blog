/**
 * @file Win95Icons.tsx
 * @description /portfolio의 Windows 95 화면에서 쓰는 폴더·문서·앱 아이콘.
 *              lucide-react의 선 아이콘으로는 픽셀 아이콘 느낌이 나지 않아 이 화면에만 직접 그린 SVG를 쓴다.
 */

interface Win95IconProps {
  /** 한 변의 px. 48은 바탕화면·폴더 안 아이콘, 16은 제목줄·주소창·작업 표시줄 */
  size?: 16 | 32 | 48;
}

export function FolderIcon({ size = 32 }: Win95IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden
      className="shrink-0"
    >
      <path d="M2 7h10l2 3h16v18H2z" className="fill-win-folder stroke-black" />
      <path d="M3 13h26" className="stroke-win-folder-edge" />
    </svg>
  );
}

export function FileIcon({ size = 32 }: Win95IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden
      className="shrink-0"
    >
      <path d="M7 2h13l6 6v22H7z" className="fill-white stroke-black" />
      <path d="M20 2v6h6" className="fill-none stroke-black" />
      <path d="M10 13h12M10 17h12M10 21h12M10 25h8" className="stroke-win-title" />
    </svg>
  );
}

/** 소개(about) 앱. 제목줄이 달린 창 안에 사람 실루엣을 그린다 */
export function ProfileAppIcon({ size = 32 }: Win95IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden
      className="shrink-0"
    >
      <rect x="2.5" y="4.5" width="27" height="23" className="fill-win-face stroke-black" />
      <rect x="3" y="5" width="26" height="4" className="fill-win-title" />
      <rect x="5.5" y="11.5" width="21" height="14" className="stroke-win-shadow fill-white" />
      <circle cx="16" cy="16" r="3" className="fill-win-title" />
      <path d="M10 25c0-4 3-6 6-6s6 2 6 6z" className="fill-win-title" />
    </svg>
  );
}

interface ProjectAppIconProps extends Win95IconProps {
  /** 아이콘 가운데 찍을 한 글자. 프로젝트 영문명의 첫 글자를 넣는다 */
  letter: string;
}

/** 프로젝트 앱. 제목줄이 달린 창 안에 프로젝트 이니셜을 찍는다 */
export function ProjectAppGlyph({ size = 32, letter }: ProjectAppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden
      className="shrink-0"
    >
      <rect x="2.5" y="4.5" width="27" height="23" className="fill-win-face stroke-black" />
      <rect x="3" y="5" width="26" height="4" className="fill-win-title" />
      <rect x="5.5" y="11.5" width="21" height="14" className="stroke-win-shadow fill-white" />
      <text
        x="16"
        y="23"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        className="fill-win-title font-win"
      >
        {letter}
      </text>
    </svg>
  );
}
