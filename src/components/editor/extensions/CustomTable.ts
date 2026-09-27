/**
 * @file CustomTable.ts
 * @description TableKit으로 Table, TableRow, TableHeader, TableCell을 한 번에 등록하는 테이블 익스텐션.
 */

import { TableKit } from '@tiptap/extension-table';

/** 노드뷰가 없는 순수 스키마라 TiptapEditor와 PostContent(정적 렌더)가 함께 쓴다. */
export const CustomTable = TableKit.configure({
  table: {
    resizable: true,
    HTMLAttributes: {
      class: 'table-auto border-collapse w-full',
    },
  },
});
