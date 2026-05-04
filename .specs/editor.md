# 에디터 스펙 (Tiptap)

## 1. 확장 구성

| 확장 | 용도 | 구현 방식 |
|---|---|---|
| StarterKit | 기본 서식 (bold, italic, heading, list 등) | Tiptap 내장 (codeBlock: false로 비활성) |
| **CustomCodeBlock** | Mac 스타일 코드 블록 + 구문 강조 | `CodeBlockLowlight` 상속 + React NodeView |
| Image | 이미지 삽입 | Supabase Storage 업로드 |
| **MermaidBlock** | 다이어그램 (flowchart, sequence, mindmap) | Tiptap Node Extension + mermaid.js 렌더링 |
| **CustomTable** | 테이블 (리사이즈 가능) | `@tiptap/extension-table` TableKit 래핑 |
| **Superscript** | 위 첨자 (`<sup>`) | `@tiptap/extension-superscript` |
| **Subscript** | 아래 첨자 (`<sub>`) | `@tiptap/extension-subscript` |

## 2. 제거됨

| 확장 | 사유 |
|---|---|
| CanvasExtension (Konva) | Mermaid/SVG로 대체, 번들 사이즈 절약 |
| TreeDiagram | 미구현, 향후 검토 |
| StructureBlock | 미구현, 향후 검토 |

## 3. CustomCodeBlock 동작

### 구조
- `CustomCodeBlock.ts` — `CodeBlockLowlight`를 상속한 Extension 정의
- `CodeBlockComponent.tsx` — React NodeView (Mac 스타일 헤더 UI)

### 에디터 모드
- Mac OS 스타일 헤더 (빨강/노랑/초록 트래픽 라이트)
- 우측 상단 드롭다운으로 언어 선택 (JS, TS, Java, HTML, CSS, JSON, Bash)
- `lowlight`를 활용한 구문 강조

### 뷰어 모드
- 언어 라벨만 표시 (선택기 비활성)
- 동일한 Mac 스타일 헤더 유지

## 4. MermaidBlock 동작

### 구조
- `MermaidBlock.tsx` — Tiptap Node Extension 정의
- `MermaidComponent.tsx` — React NodeView (헤더, 셀렉터, 코드/프리뷰)

### 에디터 모드
- 헤더에 다이어그램 템플릿 셀렉터 (Flowchart, Mindmap, Sequence, Custom)
- 코드(textarea) ↔ 프리뷰(SVG) 토글 버튼
- 푸터에 공식 문서 링크 (다이어그램 종류별 자동 분기)
- 코드 작성 중 실시간 렌더링 ID 충돌 방지 (매번 랜덤 ID 생성)

### 뷰어 모드 (게시글 상세)
- 헤더/푸터 숨김, 테두리 제거
- 자동으로 Preview(SVG 렌더링) 상태로 표시
- 편집 UI 완전 비활성

### 데이터 저장
```json
{
  "type": "mermaidBlock",
  "attrs": {
    "code": "graph TD\n  A-->B\n  A-->C"
  }
}
```

## 5. CustomTable 동작

- `@tiptap/extension-table` 패키지의 `TableKit`을 사용
- 3×3 헤더 포함 기본 테이블로 삽입 (`insertTable({ rows:3, cols:3, withHeaderRow:true })`)
- 컬럼 리사이즈 가능 (`resizable: true`)
- Tab 키로 셀 이동 지원 (Tiptap 내장)
- TiptapViewer에서도 동일한 익스텐션 등록 (읽기 전용 렌더링)
- `globals.css`에서 테이블 스타일 정의 (헤더 오렌지, 짝수 행 회색, 셀 포커스 오렌지)

## 6. 에디터 파일 구조

```
src/components/editor/
├── TiptapEditor.tsx          # 에디터 본체 (클라이언트)
├── TiptapViewer.tsx          # 뷰어 (클라이언트, editable: false)
├── Toolbar.tsx               # 도구 모음 (sticky top-0)
├── TagInputField.tsx         # 태그 입력 필드 (자동완성)
├── EditorFooter.tsx          # Fixed 하단 푸터 (작성/수정 페이지)
└── extensions/
    ├── CustomCodeBlock.ts       # CodeBlockLowlight 상속 Extension
    ├── CodeBlockComponent.tsx   # Mac 스타일 CodeBlock NodeView
    ├── CustomTable.ts           # TableKit 래핑 Extension
    ├── MermaidBlock.tsx         # Mermaid Node Extension
    └── MermaidComponent.tsx     # Mermaid React NodeView
```

## 7. 지원 언어 (CodeBlock)

JavaScript, TypeScript, Java, HTML, CSS, JSON, Bash

## 8. 툴바 (Toolbar.tsx)

| 기능 | 동작 |
|---|---|
| H1 / H2 / H3 | 헤딩 토글 |
| Bold / Italic / Strike | 텍스트 서식 |
| Superscript / Subscript | 위/아래 첨자 토글 |
| Bullet / Ordered List | 목록 |
| Blockquote | 인용구 |
| Code Block | 코드 블록 삽입 |
| Diagram | Mermaid 블록 삽입 |
| Table | 3×3 테이블 삽입 |
| Image | 이미지 업로드 (Supabase Storage) |

## 9. EditorFooter (작성/수정 페이지 전용)

`position: fixed; bottom: 0` 으로 항상 화면 하단에 고정된다.

| 위치 | 버튼 |
|---|---|
| 좌측 | 뒤로가기, 삭제 (edit 모드) |
| 우측 | 내보내기(PDF/Markdown 드롭다운), 임시저장, 게시하기/수정하기 |

- 페이지 본문에 `pb-24` 적용하여 콘텐츠가 footer에 가리지 않도록 처리

## 10. Export 기능 (`src/lib/export.ts`)

| 형식 | 구현 방식 |
|---|---|
| PDF | `window.print()` + `@media print` CSS로 UI 숨김 |
| Markdown | JSONContent → Markdown 재귀 변환 + `Blob` 다운로드 |

- Markdown 변환: heading, paragraph, bold/italic/code marks, bulletList, orderedList, blockquote, codeBlock, image, table, superscript/subscript, mermaidBlock 지원
- 외부 라이브러리 불필요
