# 에디터 스펙 (Tiptap)

## 1. 확장 구성

| 확장 | 용도 | 구현 방식 |
|---|---|---|
| StarterKit | 기본 서식 (bold, italic, heading, list 등) | Tiptap 내장 (codeBlock: false로 비활성) |
| **ShiftedHeading** | SEO 최적화 헤딩 (레벨 +1 시프트) | `Heading` 상속 + `# ` 입력 시 `h2` 파싱 |
| **CustomTable** | 테이블 (행/열 관리 및 삽입 폼) | `@tiptap/extension-table` TableKit 래핑 |
| **CustomCodeBlock** | Mac 스타일 코드 블록 + 구문 강조 | `CodeBlockLowlight` 상속 + React NodeView |
| **MermaidBlock** | 다이어그램 (flowchart, sequence, mindmap) | Tiptap Node Extension + mermaid.js 렌더링 |
| **Image** | 이미지 삽입 | Supabase Storage 업로드 |
| **Superscript** | 위 첨자 (`<sup>`) | `@tiptap/extension-superscript` |
| **Subscript** | 아래 첨자 (`<sub>`) | `@tiptap/extension-subscript` |

## 2. 제거됨

| 확장 | 사유 |
|---|---|
| StarterKit Heading | ShiftedHeading으로 대체하여 SEO 최적화 (1페이지 1H1 원칙) |
| PDF Export | 요구사항에 따라 잠정 제거, Markdown만 지원 |
| CanvasExtension (Konva) | Mermaid/SVG로 대체, 번들 사이즈 절약 |

## 3. ShiftedHeading 동작 (SEO 최적화)

- **원칙**: 페이지 내 `h1` 태그는 제목 하나로 제한하여 SEO 점수 최적화.
- **동작**: 사용자가 마크다운 문법이나 툴바 버튼을 사용할 때 내부적으로 레벨을 +1 시프트함.
    - `# ` (마크다운) / H1 (툴바) → `<h2>`
    - `## ` (마크다운) / H2 (툴바) → `<h3>`
    - `### ` (마크다운) / H3 (툴바) → `<h4>`
- **구현**: `Heading.extend`를 통해 `addInputRules`, `addKeyboardShortcuts` 재정의.
- **뷰어**: 상세 페이지 및 TOC에서도 `h2~h4` 기반으로 계층 구조 렌더링.

## 4. CustomTable 동작

### 테이블 삽입
- **삽입 폼**: 툴바의 테이블 아이콘 클릭 시 행/열 개수를 입력하는 인풋 필드 노출.
- **제한**: 테이블 내부에 커서가 있을 때는 삽입 폼이 숨겨지고 관리 메뉴만 표시됨.

### 행/열 관리 (컨텍스트 메뉴)
- 커서가 테이블 내부에 있을 때만 활성화되는 드롭다운 메뉴.
- **기능**: 아래에 행 추가, 오른쪽에 열 추가, 행 삭제, 열 삭제, 전체 열너비 동일하게, 테이블 삭제.
- **스타일**: `globals.css`에서 정의 (헤더 오렌지 `orange.100`, 셀 높이 약 24px 컴팩트 모드, 헤더 중앙 정렬).

## 5. CustomCodeBlock 동작

### 구조
- `CustomCodeBlock.ts` — `CodeBlockLowlight`를 상속한 Extension 정의
- `CodeBlockComponent.tsx` — React NodeView (Mac 스타일 헤더 UI)

### 에디터/뷰어 모드
- Mac OS 스타일 헤더 (빨강/노랑/초록 트래픽 라이트) 적용.
- 언어 선택 드롭다운 (JS, TS, Java, HTML, CSS, JSON, Bash) 및 구문 강조(`lowlight`).

## 6. MermaidBlock 동작

### 구조
- `MermaidBlock.tsx` — Tiptap Node Extension 정의
- `MermaidComponent.tsx` — React NodeView (헤더, 셀렉터, 코드/프리뷰)

### 에디터/뷰어 모드
- 다이어그램 템플릿(Flowchart, Mindmap 등) 및 실시간 Preview 제공.
- 뷰어 모드에서는 편집 UI가 숨겨지고 SVG 결과물만 렌더링됨.

## 7. 에디터 파일 구조

```
src/components/editor/
├── TiptapEditor.tsx          # 에디터 본체 (클라이언트)
├── TiptapViewer.tsx          # 뷰어 (클라이언트, editable: false)
├── Toolbar.tsx               # 도구 모음 (Context-aware Table Menu)
├── TagInputField.tsx         # 태그 입력 필드
├── EditorFooter.tsx          # Fixed 하단 푸터 (작성/수정 페이지)
├── PostTitleInput.tsx        # 제목 입력 컴포넌트
└── extensions/
    ├── ShiftedHeading.ts        # Heading 레벨 시프트 Extension
    ├── CustomCodeBlock.ts       # CodeBlockLowlight 상속 Extension
    ├── CodeBlockComponent.tsx   # Mac 스타일 CodeBlock NodeView
    ├── CustomTable.ts           # TableKit 래핑 Extension
    ├── MermaidBlock.tsx         # Mermaid Node Extension
    └── MermaidComponent.tsx     # Mermaid React NodeView
```

## 8. 툴바 (Toolbar.tsx)

| 기능 | 동작 |
|---|---|
| H1 / H2 / H3 | ShiftedHeading (H1 클릭 시 실제 h2 생성) |
| Bold / Italic / Strike | 텍스트 서식 |
| Table | 삽입 폼(밖) / 행·열 관리 메뉴(안) |
| Image | 이미지 업로드 (Supabase Storage) |
| Diagram | Mermaid 블록 삽입 |

## 9. EditorFooter (작성/수정 페이지 전용)

`position: fixed; bottom: 0` 으로 항상 화면 하단에 고정된다.

| 위치 | 버튼 |
|---|---|
| 좌측 | 뒤로가기 |
| 우측 | 임시저장, 게시하기/수정하기 |

- **참고**: '내보내기' 및 '삭제' 기능은 상세 페이지(`posts/[id]/page.tsx`)로 이동됨.

## 10. Export 기능 (`src/lib/export.ts`)

| 형식 | 구현 방식 |
|---|---|
| Markdown | JSONContent → Markdown 재귀 변환 + `Blob` 다운로드 |

## 11. 상태 관리 및 비즈니스 로직

에디터의 상태와 로직은 `PostEditor`에서 분리하여 스토어와 훅으로 관리한다.

- **`useEditorStore` (Zustand)**: 제목(`title`), 본문(`content`), 태그(`tags`), 제출 상태(`isSubmitting`) 전역 관리.
- **`useDraft` (Hook)**: 로컬 스토리지를 활용한 임시저장(Autosave), 불러오기 로직 캡슐화.
- **`usePostSubmit` (Hook)**: 유효성 검사 및 서버 액션 호출 로직 캡슐화.
- **`PostEditor.tsx`**: 위의 스토어와 훅을 조합하여 에디터 UI 구성 (Shell 역할).
