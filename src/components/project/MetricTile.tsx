/**
 * @file MetricTile.tsx
 * @description 포트폴리오 성과 수치 하나를 보여주는 타일. 무엇을 잰 값인지, 전후 값, 출처 등급을 한 묶음으로 표시한다.
 *              값은 Windows 95 화면 안의 LCD 패널처럼 검은 바탕에 주황 숫자로 띄운다.
 */

import { ArrowRight } from 'lucide-react';

import type { Metric, MetricGrade } from '@/lib/constants/portfolio';

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
}

export default function MetricTile({ metric }: MetricTileProps) {
  const { label, before, after, grade, note } = metric;

  return (
    <div className="min-w-0">
      <p className="text-gray-500">{label}</p>

      <p className="win-sunken mt-1 inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 bg-black px-3 py-1.5">
        {before && (
          <>
            <span className="text-gray-400">{before}</span>
            <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <span className="sr-only">에서</span>
          </>
        )}
        <span className="text-base font-bold text-orange-400">{after}</span>
      </p>

      <p className="mt-1 text-gray-500">
        <span aria-hidden>{GRADE_SYMBOL[grade]} </span>
        {grade}
        {note && ` · ${note}`}
      </p>
    </div>
  );
}
