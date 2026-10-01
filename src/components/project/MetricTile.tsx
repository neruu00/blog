/**
 * @file MetricTile.tsx
 * @description 포트폴리오 성과 수치 하나를 보여주는 타일. 무엇을 잰 값인지, 전후 값, 출처 등급을 한 묶음으로 표시한다.
 *              compact면 배경 없이 과제의 지표 행 안에 붙는다.
 */

import { ArrowRight } from 'lucide-react';

import type { Metric, MetricGrade } from '@/lib/constants/portfolio';
import { cn } from '@/lib/utils';

/** 등급 기호. 기호는 장식이라 스크린리더에서 숨기고 뜻은 텍스트로 함께 적는다 */
const GRADE_SYMBOL: Record<MetricGrade, string> = {
  실측: '●',
  인용: '○',
  계산: '◐',
  구조: '■',
  '못 잼': '✕',
};

interface MetricTileProps {
  metric: Metric;
  compact?: boolean;
}

export default function MetricTile({ metric, compact = false }: MetricTileProps) {
  const { label, before, after, grade, note } = metric;

  return (
    <div className={cn(compact ? 'min-w-0' : 'rounded-xl bg-gray-50 p-4')}>
      <p className="text-xs text-gray-400">{label}</p>

      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {before && (
          <>
            <span className="text-sm text-gray-400">{before}</span>
            <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="sr-only">에서</span>
          </>
        )}
        <span
          className={cn(
            'tracking-tight text-gray-900',
            compact ? 'text-base font-semibold' : 'text-2xl font-bold',
          )}
        >
          {after}
        </span>
      </p>

      <p className="mt-1 text-xs text-gray-400">
        <span aria-hidden>{GRADE_SYMBOL[grade]} </span>
        {grade}
        {note && ` · ${note}`}
      </p>
    </div>
  );
}
