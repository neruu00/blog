# 에디터 스펙 (Tiptap)

## 1. 기존 유지 확장

| 확장 | 용도 |
|---|---|
| StarterKit | 기본 서식 (bold, italic, heading, list 등) |
| CodeBlockLowlight | 코드 블록 + 구문 강조 (highlight.js) |
| Image | 이미지 삽입 (Supabase Storage 업로드) |

## 2. 추가 확장

| 확장 | 용도 | 구현 방식 |
|---|---|---|
| **MermaidBlock** | 다이어그램 (flowchart, sequence 등) | Tiptap Node Extension + mermaid.js 렌더링 |
| **TreeDiagram** | 트리 구조 시각화 (폴더 구조 등) | Tiptap Node Extension + CSS/SVG |
| **StructureBlock** | 리스트/구조도 (들여쓰기 기반) | Tiptap Node Extension |

## 3. 제거

| 확장 | 사유 |
|---|---|
| CanvasExtension (Konva) | Mermaid/SVG로 대체, 번들 사이즈 절약 |

## 4. MermaidBlock 동작

### 에디터 모드
- 코드 블록처럼 Mermaid 문법을 텍스트로 입력
- 실시간 프리뷰 토글 (코드 ↔ 렌더링)

### 뷰어 모드
- 저장된 Mermaid 코드를 `mermaid.js`로 SVG 렌더링
- 이미지로 저장하지 않으므로 **스토리지 절약**

### 데이터 저장
```json
{
  "type": "mermaidBlock",
  "attrs": {
    "code": "graph TD\n  A-->B\n  A-->C"
  }
}
```

## 5. TreeDiagram 동작

### 입력
```
src/
├── components/
│   ├── PostCard.tsx
│   └── Modal/
└── lib/
    └── utils.ts
```

### 렌더링
- CSS + Unicode 문자로 트리 구조 표현
- 이미지 없이 텍스트/CSS만으로 렌더링

## 6. 에디터 파일 구조

```
src/components/editor/
├── TiptapEditor.tsx      # 에디터 본체 (클라이언트)
├── TiptapViewer.tsx      # 뷰어 (서버/클라이언트)
├── Toolbar.tsx           # 도구 모음
└── extensions/
    ├── MermaidBlock/
    │   ├── MermaidNode.ts        # Node Extension 정의
    │   └── MermaidNodeView.tsx   # React NodeView
    ├── TreeDiagram/
    │   ├── TreeNode.ts
    │   └── TreeNodeView.tsx
    └── StructureBlock/
        ├── StructureNode.ts
        └── StructureNodeView.tsx
```

## 7. 지원 언어 (CodeBlock)

JavaScript, TypeScript, Java, HTML, CSS, JSON, Bash, Python, SQL
