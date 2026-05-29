/**
 * @file IconButton.tsx
 * @description 아이콘 버튼을 위한 공통 컴포넌트
 */

import { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  variant?: 'ghost' | 'danger';
}

export default function IconButton({
  icon,
  label,
  variant = 'ghost',
  className = '',
  ...props
}: IconButtonProps) {
  const baseClasses = 'rounded-lg p-2 transition-colors';
  const variantClasses =
    variant === 'danger'
      ? 'text-red-500 hover:bg-red-50'
      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      aria-label={label}
      {...props}
    >
      {icon}
    </button>
  );
}
