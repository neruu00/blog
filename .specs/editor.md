# 에디터 스펙 (Tiptap)

## 1. 확장 구성

| 확장 | 용도 | 구현 방식 |
|---|---|---|
| StarterKit | 기본 서식 (bold, italic, heading, list 등) | Tiptap 내장 (codeBlock: false로 비활성) |
| **CustomCodeBlock** | Mac 스타일 코드 블록 + 구문 강조 | `CodeBlockLowlight` 상속 + React NodeView |
| Image | 이미지 삽입 | Supabase Storage 업로드 |
| **MermaidBlock** | 다이어그램 (flowchart, sequence, mindmap) | Tiptap Node Extension + mermaid.js 렌더링 |

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

## 5. 에디터 파일 구조

```
src/components/editor/
├── TiptapEditor.tsx          # 에디터 본체 (클라이언트)
├── TiptapViewer.tsx          # 뷰어 (클라이언트, editable: false)
├── Toolbar.tsx               # 도구 모음 (sticky top-0)
├── TagInputField.tsx         # 태그 입력 필드 (자동완성)
└── extensions/
    ├── CustomCodeBlock.ts       # CodeBlockLowlight 상속 Extension
    ├── CodeBlockComponent.tsx   # Mac 스타일 CodeBlock NodeView
    ├── MermaidBlock.tsx         # Mermaid Node Extension
    └── MermaidComponent.tsx     # Mermaid React NodeView
```

## 6. 지원 언어 (CodeBlock)

JavaScript, TypeScript, Java, HTML, CSS, JSON, Bash

## 7. 툴바 (Toolbar.tsx)

| 기능 | 동작 |
|---|---|
| H1 / H2 / H3 | 헤딩 토글 |
| Bold / Italic | 텍스트 서식 |
| Bullet / Ordered List | 목록 |
| Blockquote | 인용구 |
| Code (인라인) | 인라인 코드 |
| Code Block | 코드 블록 삽입 |
| Image | 이미지 업로드 (Supabase Storage) |
| Diagram | Mermaid 블록 삽입 |
