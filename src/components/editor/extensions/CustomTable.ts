/**
 * @file CustomTable.ts
 * @description Tiptap Table 익스텐션 설정.
 *              TableKit을 사용하여 Table, TableRow, TableHeader, TableCell을 한 번에 등록한다.
 */

import { TableKit } from '@tiptap/extension-table';

/**
 * 테이블 익스텐션 (TableKit).
 * TiptapEditor / TiptapViewer의 extensions 배열에 추가한다.
 */
export const CustomTable = TableKit.configure({
  table: {
    resizable: true,
    HTMLAttributes: {
      class: 'table-auto border-collapse w-full',
    },
  },
});
