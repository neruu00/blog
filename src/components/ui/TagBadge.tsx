/**
 * @file TagBadge.tsx
 * @description 해시태그를 표시하는 공통 UI 프리미티브 컴포넌트.
 */

interface TagBadgeProps {
  tag: string;
  variant?: 'default' | 'solid' | 'primary';
}

export default function TagBadge({ tag, variant = 'default' }: TagBadgeProps) {
  const baseClasses = 'rounded-full px-2.5 py-1 text-xs font-medium';
  let variantClasses = 'bg-gray-50 text-gray-500'; // default

  if (variant === 'solid') {
    variantClasses = 'bg-gray-100 text-gray-600';
  } else if (variant === 'primary') {
    variantClasses = 'bg-orange-50 text-orange-600';
  }

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      {tag.startsWith('#') ? tag : `#${tag}`}
    </span>
  );
}
