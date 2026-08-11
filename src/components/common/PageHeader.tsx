/**
 * @file PageHeader.tsx
 * @description 페이지 최상단 제목 영역. h1 스타일의 단일 출처.
 */

interface PageHeaderProps {
  title: string;
  /** 제목 아래 설명 문구. 문자열 외 요소(예: 글 개수 카운터)도 허용 */
  description?: React.ReactNode;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-10">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
      {description && <p className="leading-relaxed text-gray-500">{description}</p>}
    </header>
  );
}
