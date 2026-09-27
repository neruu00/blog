# 에디터 (Tiptap)

> **스코프**: Tiptap 확장 구성과 각 확장의 동작, 에디터 상태 관리.
> 에디터 UI 색·스타일 값은 `design-system.md` "에디터 전용 스타일" 참조.

## 확장 구성

| 확장 | 용도 | 구현 방식 |
|---|---|---|
| StarterKit | 기본 서식 (bold, italic, list 등) | Tiptap 내장 (`codeBlock: false`, heading은 ShiftedHeading으로 대체) |
| **ShiftedHeading** | SEO 최적화 헤딩 (레벨 +1 시프트) | `Heading` 상속 + `# ` 입력 시 `h2` 파싱 |
| **CustomTable** | 테이블 (행/열 관리 및 삽입 폼) | `@tiptap/extension-table` TableKit 래핑 |
| **CustomCodeBlock** | Mac 스타일 코드 블록 + 구문 강조 | `CodeBlockLowlight` 상속 + React NodeView |
| **MermaidBlock** | 다이어그램 (flowchart, sequence, mindmap) | Tiptap Node Extension + mermaid.js 렌더링 |
| **Image** | 이미지 삽입 | Supabase Storage 업로드 |
| **Superscript** / **Subscript** | 위/아래 첨자 | `@tiptap/extension-superscript` / `-subscript` |

### 제거된 확장 — 재도입 전에 사유 확인

| 확장 | 사유 |
|---|---|
| StarterKit Heading | ShiftedHeading으로 대체 (1페이지 1H1 원칙) |
| PDF Export | 요구사항에 따라 잠정 제거, Markdown만 지원 |
| CanvasExtension (Konva) | Mermaid/SVG로 대체, 번들 사이즈 절약 |

## ShiftedHeading (SEO 헤딩 시프트)

- **원칙**: 페이지 내 `h1`은 게시글 제목 하나로 제한한다
- **동작**: 마크다운 문법·툴바 버튼 모두 내부적으로 레벨 +1
  - `# ` / H1 버튼 → `<h2>`, `## ` / H2 → `<h3>`, `### ` / H3 → `<h4>`
- **구현**: `Heading.extend`로 `addInputRules`, `addKeyboardShortcuts` 재정의
- **뷰어/TOC**: 상세 페이지와 TOC도 `h2~h4` 기준으로 계층 렌더링

## CustomTable

### 삽입

- 툴바의 테이블 아이콘 클릭 시 행/열 개수 입력 폼 노출
- 커서가 테이블 내부에 있으면 삽입 폼 대신 관리 메뉴만 표시

### 행/열 관리 (컨텍스트 메뉴)

- 커서가 테이블 내부일 때만 활성화되는 드롭다운
- 기능: 아래에 행 추가, 오른쪽에 열 추가, 행 삭제, 열 삭제, 전체 열너비 동일하게, 테이블 삭제
- 스타일은 `globals.css`에 정의 — 값은 `design-system.md` "에디터 전용 스타일"

## CustomCodeBlock

- `CustomCodeBlock.ts` — `CodeBlockLowlight` 상속 Extension
- `CodeBlockComponent.tsx` — React NodeView (Mac 스타일 헤더: 빨강/노랑/초록 트래픽 라이트)
- 언어 선택 드롭다운 (JS, TS, Java, HTML, CSS, JSON, Bash) + `lowlight` 구문 강조

## MermaidBlock

- `MermaidBlock.tsx` — Tiptap Node Extension 정의
- `MermaidComponent.tsx` — React NodeView (헤더, 셀렉터, 코드/프리뷰)
- 에디터: 다이어그램 템플릿(Flowchart, Mindmap 등) + 실시간 Preview
- 뷰어: 편집 UI 숨김, SVG 결과물만 렌더링

## 파일 구조

```
src/components/editor/
├── TiptapEditor.tsx          # 에디터 본체 (클라이언트)
├── Toolbar.tsx               # 도구 모음 (테이블 메뉴는 DropdownMenu)
├── TagInputField.tsx         # 태그 입력 필드
├── EditorFooter.tsx          # Fixed 하단 푸터 (작성/수정 페이지)
├── PostTitleInput.tsx        # 제목 입력 컴포넌트
└── extensions/
    ├── ShiftedHeading.ts        # Heading 레벨 시프트 (순수 스키마 — 에디터·뷰어 공용)
    ├── CustomCodeBlock.ts       # CodeBlockLowlight + React NodeView (에디터 전용)
    ├── CodeBlockComponent.tsx   # 코드블록 NodeView — CodeBlockFrame 안에 NodeViewContent
    ├── CodeBlockFrame.tsx       # Mac 스타일 프레임. 에디터 NodeView와 StaticCodeBlock이 공유
    ├── CustomImage.ts / ImageComponent.tsx   # 업로드 스켈레톤 NodeView (에디터 전용)
    ├── CustomTable.ts           # TableKit 래핑 (순수 스키마 — 공용)
    ├── MermaidBlockSchema.ts    # Mermaid 노드 정의만 (공용) — mermaid 라이브러리 import 없음
    ├── MermaidBlock.tsx         # 스키마 + React NodeView (에디터 전용)
    ├── MermaidComponent.tsx     # Mermaid NodeView — 편집/미리보기 토글, 미리보기는 MermaidDiagram
    └── MermaidDiagram.tsx       # 코드 → SVG 클라이언트 컴포넌트. 에디터 미리보기·읽기 화면 공용
                                 # mermaid는 동적 import + 뷰포트 진입 시 렌더 (아래)

src/components/post/
├── PostContent.tsx           # 읽기 화면 본문 — @tiptap/static-renderer로 JSON → React (서버)
└── StaticCodeBlock.tsx       # 읽기 화면 코드블록 — highlight.js 서버 강조 + CodeBlockFrame
```

**TiptapViewer는 2026-08-27에 삭제됐다.** 읽기 화면이 클라이언트 에디터(`editable: false`)로 본문을 그리던 탓에 서버 HTML에 본문이 없었고(검색엔진·링크 미리보기에 스켈레톤만 보임) 읽기 페이지가 Tiptap 런타임 전체를 실었다. 지금은 `PostContent`가 서버에서 정적으로 렌더링한다 — 결정 근거는 `PLAN.md` 결정 로그.

**스키마/노드뷰 분리 원칙**: 서버 렌더러는 스키마만 필요하다. 노드뷰가 붙은 확장(`MermaidBlock`, `CustomCodeBlock`, `CustomImage`)을 서버에서 import하면 mermaid·`@tiptap/react`가 서버 번들로 끌려온다. 그래서 `MermaidBlockSchema`처럼 **정의만 있는 파일을 두고, 에디터 쪽이 `.extend({ addNodeView })`로 노드뷰를 붙인다.** 코드블록·이미지는 StarterKit/기본 Image의 스키마가 같아 별도 파일이 필요 없었다.

> ⚠️ **이 분리는 서버 번들만 막는다.** `PostContent`는 여전히 클라이언트 컴포넌트 `MermaidDiagram`을 import하므로, 그 파일이 mermaid를 정적 import하면 **읽기 페이지의 클라이언트 번들**에 mermaid + d3 + dompurify가 그대로 들어간다. 실제로 그랬고, 다이어그램이 0개인 글까지 148 kB를 받아 실행해 본문 LCP가 밀렸다. 그래서 `MermaidDiagram`은 `import('mermaid')`로 지연 로드하고 `initialize`도 그 안에서 한 번만 돈다 — 측정값은 `PLAN.md` 결정 로그.

**다이어그램 렌더 시점**: `MermaidDiagram`은 `useInViewOnce(rootMargin: '200px 0px')`로 **뷰포트에 가까워졌을 때만** 그린다. 글 하나에 다이어그램이 여럿이고 대개 첫 화면 밖이라, 전부 로드 시점에 그리면 메인스레드를 오래 붙잡는다. 에디터 미리보기도 같은 컴포넌트를 쓰는데, `MermaidComponent`가 편집/미리보기를 **조건부 마운트**(CSS로 숨기지 않음)하므로 미리보기로 바꾸는 순간 화면 안에 있어 바로 그려진다.

> ⚠️ **에디터에 확장을 추가하면 `PostContent.tsx`의 `POST_SCHEMA`에도 추가하라.** 스키마에 없는 노드 타입이 저장된 JSON에 있으면 정적 렌더가 실패한다.

## 툴바 (Toolbar.tsx)

| 기능 | 동작 |
|---|---|
| H1 / H2 / H3 | ShiftedHeading (H1 클릭 시 실제 h2 생성) |
| Bold / Italic / Strike | 텍스트 서식 |
| Table | 삽입 폼(테이블 밖) / 행·열 관리 메뉴(테이블 안) |
| Image | 이미지 업로드 (Supabase Storage) |
| Diagram | Mermaid 블록 삽입 |

## EditorActions (작성/수정 페이지 전용)

우하단 고정 플로팅 아이콘 버튼 묶음 (`fixed right-6 bottom-6`, 세로 스택). 2026-08-27에 하단 고정 바(`EditorFooter`)를 대체했다.

| 순서 | 버튼 | 아이콘 | 스타일 |
|---|---|---|---|
| 위 | 뒤로가기 | `ArrowLeft` | `outline`, 48px |
| 가운데 | 임시저장 | `Save` | `outline`, 48px |
| 아래 | 게시하기 / 수정하기 | `Send` / `Check` | `primary`, 56px |

- **위→아래가 곧 탭 순서**이고, 주 액션(제출)이 가장 아래·가장 크다
- 제출 중에는 전부 disabled, 제출 버튼만 `Loader2` 스피너
- 아이콘 전용이라 **`Tooltip`(마우스·키보드) + `aria-label`(스크린리더)를 각각** 준다 — 터치 기기에는 툴팁이 뜨지 않는다
- 떠 있는 요소라 그림자를 쓴다 (`shadow-lg` → hover `shadow-xl` + `-translate-y-1`). 홈의 `FloatingActionButton`과 같은 결
- 제출 버튼은 `type="submit"`이므로 **`PostEditor`의 `<form>` 안에 있어야 한다**
- 인쇄 시 숨김: `globals.css`의 `@media print`가 `[data-editor-actions]`를 잡는다

`(blog)` 레이아웃의 `FloatingActionButton`은 `(protected)` 그룹에 렌더되지 않으므로 작성/수정 페이지에서 겹치지 않는다.

'내보내기'와 '삭제'는 상세 페이지(`posts/[id]/page.tsx`)에 있다 — 에디터 액션이 아니다.

## Export (`src/lib/export.ts`)

Markdown만 지원: JSONContent → Markdown 재귀 변환 + `Blob` 다운로드.

## 상태 관리

에디터 상태와 로직은 `PostEditor`에서 분리해 스토어와 훅으로 관리한다.

- **`useEditorStore` (Zustand)** — 제목, 본문, 태그, 제출 상태(`isSubmitting`) 전역 관리
- **`useDraft` (Hook)** — 로컬 스토리지 임시저장(Autosave)·불러오기
- **`usePostSubmit` (Hook)** — 유효성 검사 + 서버 액션 호출
- **`PostEditor.tsx`** — 위 스토어·훅을 조합하는 Shell
