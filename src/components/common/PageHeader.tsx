/**
 * @file PageHeader.tsx
 * @description 페이지 최상단 제목 영역. h1 스타일의 단일 출처.
 */

interface PageHeaderProps {
  title: string;
  /** 제목 오른쪽에 같은 줄로 붙는 보조 표기. 예: 프로젝트 영문명 */
  titleAside?: React.ReactNode;
  /** 제목 아래 설명 문구. 문자열 외 요소(예: 글 개수 카운터)도 허용 */
  description?: React.ReactNode;
  /** 설명 아래에 붙는 메타 정보·링크 */
  children?: React.ReactNode;
}

export default function PageHeader({ title, titleAside, description, children }: PageHeaderProps) {
  return (
    <header className="mb-10">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        {titleAside}
      </div>
      {/* falsy지만 렌더 가능한 값(0 등)이 스타일 없이 새어나가지 않도록 null 계열만 생략 */}
      {description != null && <p className="leading-relaxed text-gray-500">{description}</p>}
      {children}
    </header>
  );
}
