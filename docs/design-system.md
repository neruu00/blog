# 디자인 시스템

> **범위**: 컬러, 타이포그래피, 레이아웃, 컴포넌트 스타일 레시피.
> 스타일 **규칙**(3단 텍스트 계층, 플랫 원칙, 임의 hex 금지 등)의 원본은 저장소 `AGENTS.md`의 스타일링 섹션이다. 여기에는 구체적인 값을 담는다.

## 디자인 방향

- **화이트 모던** — velog에서 영감을 받았다. **라이트 모드 전용** (다크모드 없음, `dark:` 클래스 금지)
- 상단 여백을 최대한 넓혀 세로로 시원한 느낌
- 데스크톱 네비게이션은 사이드에 배치

## 컬러

**Tailwind 기본 팔레트를 최대한 활용**하고, 기본 팔레트에 없는 값만 custom theme으로 정의한다.

### 퍼스널 컬러 (오렌지) — 기본 팔레트

| 용도 | Tailwind 클래스 |
|---|---|
| 배경 하이라이트 | `orange-50` |
| 호버 배경 | `orange-100` |
| 서브 포인트 | `orange-400` |
| **메인 포인트** | `orange-500` |
| 호버 포인트 | `orange-600` |
| 액티브 포인트 | `orange-700` |

### 상태 색

| 용도 | Tailwind 클래스 |
|---|---|
| 에러/삭제 | `red-500` |
| 성공 | `green-500` |

텍스트 3단 계층(`gray-900`/`gray-500`/`gray-400`)과 보더 색(`gray-100`/`gray-200`)의 원본은 `AGENTS.md`의 스타일링 섹션이다.

### Custom Theme 토큰 — 기본 팔레트 외 값

| 토큰 | 값 | 용도 |
|---|---|---|
| `surface` | `#ffffff` | 기본 배경 |
| `surface-alt` | `#fafafa` | 대안 배경 (gray-50과 미세한 차이) |
| `code-bg` | `#f8f9fa` | 코드 블록 배경 |

## 타이포그래피

| 용도 | 폰트 | Tailwind 클래스 |
|---|---|---|
| 본문 | Pretendard Variable | `font-sans` |
| 코드 | Geist Mono | `font-mono` |

**기울임(`italic`)은 쓰지 않는다.** Pretendard에는 이탤릭이 없어 브라우저가 합성한 oblique가 적용되고, 한글에서 특히 뭉개진다. 강조는 굵기·색으로 한다.

**텍스트 선택색은 `orange-100`** (`::selection`, 전역). 코드블록은 어두운 표면이므로 `orange-500/30`을 따로 쓴다.

### 크기 체계

| 용도 | 클래스 | 예시 |
|---|---|---|
| 페이지 제목 | `text-3xl font-bold` | 게시글 제목 |
| 본문 제목 (H1 대응 h2) | `text-2xl font-bold` | 에디터 내 # 헤딩 |
| 본문 부제목 (H2 대응 h3) | `text-xl font-bold` | 에디터 내 ## 헤딩 |
| 본문 소제목 (H3 대응 h4) | `text-lg font-bold` | 에디터 내 ### 헤딩 |
| 본문 | `text-base` | 게시글 본문 |
| 캡션/메타 | `text-sm text-gray-500` | 날짜, 태그 |
| 작은 텍스트 | `text-xs text-gray-400` | 카운터, 힌트 |

### 본문 스타일 (.prose)

- 읽기 화면(게시글 상세·뉴스 상세)의 본문 타이포는 `globals.css`의 `.prose` 오버라이드가 **단일 출처**다
- 페이지별 인라인 `prose-*` 체인을 만들지 않는다
- `prose` 클래스가 붙는 곳은 세 군데뿐이다: `PostContent`(게시글 읽기, 서버), 뉴스 상세의 `ReactMarkdown` 래퍼, `TiptapEditor`의 ProseMirror 요소(편집). **한 본문에 두 번 겹치지 않는다** — 안쪽 `.prose`가 자체 `font-size: 1rem`을 다시 선언해 바깥 `prose-lg`를 무력화한다

**오버라이드가 우선하는 이유**: `globals.css`의 `.prose` 규칙은 `@layer` **밖**에 있고, typography 플러그인 규칙은 `@layer utilities` 안에 있다. 레이어 밖 스타일은 특이도와 관계없이 항상 레이어 안의 스타일보다 우선한다. 게다가 플러그인은 선택자를 `:where()`로 감싸 특이도를 `(0,1,0)`으로 낮춘다. **따라서 `.prose` 오버라이드에는 `!important`도, 긴 선택자도 쓰지 않는다.** `.prose li > p`면 충분하다.

**읽기 본문 글자색은 `gray-700`이다.** typography가 `--tw-prose-body`를 `.prose` 요소에 직접 선언하므로 감싸는 div의 `text-gray-900`은 본문에 적용되지 않는다. 장문 가독성에는 700이 적절하므로 그대로 둔다 — 컴포넌트 텍스트 3단(900/500/400)과는 별개의 읽기 전용 값이다. 헤딩은 `--tw-prose-headings` = gray-900.

**링크는 `orange-700`.** `prose-orange` 기본값인 orange-600은 흰 배경 대비가 3.6:1로 AA 기준에 미달하므로 `.prose { --tw-prose-links }`로 덮어쓴다.

> 📌 **본문 크기가 나뉘어 있다**: 뉴스 상세는 `prose-lg`(18px), 게시글 상세(`PostContent`)와 편집 화면(`TiptapEditor`)은 16px다. 통일 여부는 `PLAN.md` T-314.

### 목록 (ul / ol)

Tiptap의 listItem은 항상 `<li><p>…</p></li>`로 렌더링된다. typography는 li 안 문단의 `:first-child`에 위쪽 마진을, `:last-child`에 아래쪽 마진을 `1.25em`씩 주는데, **문단이 하나뿐이면 같은 `<p>`에 두 규칙이 동시에 적용된다.** 그래서 아래처럼 `li > p`의 마진을 0으로 둔다.

| 항목 | 값 | 비고 |
|---|---|---|
| `li > p` 위·아래 마진 | `0` | 위쪽 이중 마진 방지 |
| `li > p + p` | `0.75em` | 문단이 여럿인 항목만 사이를 띄운다 |
| `li` 위·아래 마진 | `0.25em` | 항목 간격 |
| `ul`/`ol` 들여쓰기 | `padding-inline-start: 1.5em` | 본문과 구분되도록 (typography 기본 1.625em) |
| 중첩 목록 마진 | `0.25em` | |

**마커는 `color: inherit` — 본문과 같은 색이다.** 들여쓰기로 구분한다.

### 인용·주석 블록 (blockquote)

플랫 원칙에 따라 **테두리 없이 배경만** 쓴다 — `bg-orange-50`, `rounded-xl`, `padding: 1rem 1.25rem`, 본문 `gray-500`.

- 기울임 제거 (위 폰트 항목 참조). typography 기본값인 `font-weight: 500`도 400으로 되돌린다
- `> **주의**` 같은 머리말이 묻히지 않도록 `blockquote strong`만 `gray-900`
- `orange-50` 위의 `gray-500`은 4.55:1로 AA 기준을 통과한다. 더 밝은 회색으로 낮추지 마라

### 테이블

플랫 원칙: **세로선·전체 격자 없이 가로 구분선만 쓴다.** 에디터와 읽기 화면은 같은 `.prose` 테이블 스타일을 쓴다.

| 요소 | 스타일 |
|---|---|
| 셀 (`th`, `td`) | `padding: 0.625rem 0.75rem`, 좌측 정렬, `border-bottom: 1px gray-100` |
| 헤더 (`th`) | `bg-gray-50 text-gray-900 font-semibold` |
| 마지막 행 | 아래 구분선 없음 |
| 글자 | `text-sm`, `line-height: 1.5`, 셀 안 `p` 마진 0 |

**Tiptap 테이블에는 `thead`가 없다** — 첫 행이 `<th>`로 `tbody` 안에 들어간다. typography의 `thead th` 규칙이 적용되지 않으므로 `.prose th`를 직접 지정한다.

**넓은 표는 `.tableWrapper` 안에서만 스크롤한다.** 에디터는 `resizable: true` 노드뷰가 표를 `<div class="tableWrapper">`로 감싸고, 읽기 화면은 `PostContent`의 `table` 매핑이 같은 래퍼를 직접 만든다. 이 클래스에 `overflow-x: auto`가 없으면 모바일에서 페이지 전체가 가로로 밀린다. 표 바깥 마진(`1.5rem 0`)은 래퍼가 가진다.

### 인라인 코드

`bg-gray-100` + `text-orange-700`. **orange-600은 gray-100 위에서 대비가 3.2:1로 AA 기준에 미달**한다.

### 코드블록

어두운 표면(`code-block` 토큰) + Mac 헤더는 의도한 대비 요소다. 프레임 마크업은 `CodeBlockFrame` 하나가 단일 출처이며, 에디터 NodeView와 읽기 화면(`StaticCodeBlock`)이 공유한다. **그림자는 쓰지 않는다** — 배경 대비만으로 충분히 구분되며, "그림자는 떠 있는 요소에만" 규칙의 예외가 아니다. 구문 강조 테마는 `layout.tsx`가 `highlight.js/styles/atom-one-dark.css`를 전역으로 로드한다.

## 에디터 전용 스타일

테이블 기본 스타일은 위 "테이블"과 같다. 편집 화면에만 있는 스타일은 아래 두 가지다.

- **선택된 셀** (`.ProseMirror .selectedCell`): `orange-100` 배경
- **열 너비 리사이저 핸들** (`.column-resize-handle`): 4px `orange-400` 막대

## 레이아웃

### 데스크톱 (≥ 1024px)

```
┌────────────┬─────────────────────────────────────────┐
│            │                                         │
│   SideNav  │           (넓은 상단 여백)               │
│   (fixed)  │                                         │
│            │                                         │
│   w-64     │         Main Content Area               │
│            │         max-w-3xl (768px)                │
│   Logo     │         mx-auto                         │
│   ─────    │                                         │
│   Home     │                                         │
│   Posts    │                                         │
│   News     │                                         │
│            │                                         │
│            │              Footer                     │
└────────────┴─────────────────────────────────────────┘
```

### 모바일 (< 1024px)

```
┌───────────────────────────────┐
│  ☰ Logo                      │  ← MobileHeader (sticky)
├───────────────────────────────┤
│                               │
│        Main Content           │
│        px-6                   │
│                               │
├───────────────────────────────┤
│          Footer               │
└───────────────────────────────┘
```

### 사이드 네비게이션

- 로고 / 프로필 아바타
- Home / Posts / News (`lib/constants/nav.ts`)
- 하단: 로그인/프로필 버튼
- 글쓰기 진입은 사이드 네비게이션이 아니라 `FloatingActionButton`(admin 전용)이 담당

## 컴포넌트 스타일

### 버튼 (Button)

**모든 버튼은 `ui/Button` 하나를 쓴다.** 페이지 안에서 `<button className="bg-orange-500 …">`를 다시 만들지 않는다.

`href`를 주면 `next/link`로, 없으면 `<button type="button">`으로 렌더링한다. `className`은 `cn`(tailwind-merge)으로 병합되므로 개별 override도 안전하다.

| variant | 스타일 | 사용처 |
|---|---|---|
| `primary` (기본) | `bg-orange-500 text-white hover:bg-orange-600`, disabled `bg-gray-300` | 게시하기/수정하기, 다시 시도, 홈으로, 확인, 테이블 생성 |
| `outline` | `border border-gray-200 bg-white text-gray-900 hover:bg-gray-50` | 임시저장, 내보내기, 수정, 전체 글 보기, 로그인 |
| `ghost` | `text-gray-500 hover:bg-gray-100 hover:text-gray-900` | 취소, 뒤로가기, 아이콘 버튼 전반, 에디터 툴바 |
| `destructive` | `bg-red-500 text-white hover:bg-red-600` | 게시글 삭제, 삭제 확인 |

| size | 스타일 |
|---|---|
| `sm` | `h-9 px-4 text-sm` |
| `md` (기본) | `h-10 px-4 text-sm` |
| `icon` | `h-9 w-9` — 정사각 아이콘 전용 |

공통 베이스: `inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors`

**토글은 `aria-pressed`로 표현한다.** `ghost`에 `aria-pressed:bg-orange-100 aria-pressed:text-orange-600`이 들어 있어, 에디터 툴바·Mermaid Code/Preview 토글이 별도 variant 없이 활성 스타일을 얻는다. 상태도 접근성 트리에 함께 반영된다.

```tsx
<Button variant="ghost" size="icon" aria-pressed={editor.isActive('bold')} title="Bold">
  <Bold className="h-5 w-5" />
</Button>
```

에러/404 페이지의 주 액션도 `primary`(orange)를 쓴다.

**커서는 컴포넌트가 아니라 `globals.css`가 전역으로 정한다**: `button:not(:disabled), select:not(:disabled)` → `pointer`, `button:disabled` → `not-allowed`. 컴포넌트마다 `cursor-pointer`를 붙이지 않는다.

- 위험한 아이콘 버튼은 `variant="ghost"` + `text-red-500 hover:bg-red-50`
- 본문 텍스트 링크에는 Button이 아니라 `<Link className="text-orange-500 hover:underline">`를 쓴다

### Button을 쓰지 않는 예외

- `layout/ProfileButton` — 사이드바의 '행'이므로 NavLinks와 같은 형태다. Button으로 감싸면 오버라이드가 variant보다 길어진다
- `layout/FloatingActionButton`, `common/Pagination`, `ui/FilterChip` — FAB·페이지 링크·필터 알약마다 고유한 형태가 있다
- `editor/TagInputField`의 태그 칩 안 X, `ui/DropdownMenu.Item` — 상위 컴포넌트에 종속된 내부 요소

### 카드

목록 카드(PostCard, NewsCard)는 박스가 아니라 **플랫 리스트 항목**이다. 컨테이너의 `divide-y divide-gray-100`으로 구분하고, hover는 제목 색 전환(`group-hover:text-orange-500`)으로 표현한다. 테두리·그림자·배경 박스는 쓰지 않는다.

그림자는 떠 있거나 고정된 요소에만 쓴다 — sticky 툴바, EditorActions, FAB, 모달, 드롭다운.

### 홈 포스터

- 시그니처는 `EyePoster`(방범카메라) 하나 — 마우스를 따라 움직이는 눈동자 + 「作動中!」. `h-64 border-gray-200 bg-gray-100`
- 마우스 전용 장식 요소이므로 **md 미만에서는 숨긴다**
- 홈은 시각적 제목 없이 포스터(1/5) + 최신 뉴스(4/5)로 시작한다 — 문서 아웃라인용 `sr-only` h1만 둔다

### 입력 필드

```
bg-white border border-gray-200 rounded-lg px-4 py-2
focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
```

키보드 포커스는 `globals.css`의 전역 규칙(`a:focus-visible, button:focus-visible` → orange-500 아웃라인 2px)이 담당한다.

### 태그/뱃지 (TagBadge)

- **단일 스타일**: `rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700` — 컴팩트 스퀘어, 테두리 없음 (플랫 원칙)
- 텍스트는 `orange-700` — orange-600은 orange-50 배경과의 대비가 3.3:1로 12px 텍스트의 AA 기준(4.5:1)에 미달한다
- 게시글 기술 태그와 뉴스 소스 라벨은 같은 컴포넌트를 쓴다
- `tag` prop에 `#` 접두사가 없으면 자동으로 붙인다. 뉴스 소스 라벨은 `hash={false}`

### 스켈레톤 (Skeleton)

- **모든 로딩 스켈레톤은 `ui/Skeleton` 하나를 쓴다**: `animate-pulse rounded-md bg-gray-100`
- 크기·모양은 `className`으로 덮어쓴다 (`cn`이 tailwind-merge이므로 `rounded-full` 등으로 override 가능)
- 동적 너비 등 런타임 계산값에만 `style` prop을 쓴다

### 드롭다운 (DropdownMenu)

- Context 기반 합성 컴포넌트 패턴 (`DropdownMenu` + `DropdownMenu.Item`)
- **`trigger`는 render prop이다.** 전달받은 `onClick`/`aria-expanded`를 실제 버튼에 펼쳐야 한다. 래퍼로 감싸면 접근성 트리에 버튼이 두 개로 잡힌다

```tsx
<DropdownMenu trigger={(props) => <Button variant="outline" {...props}>내보내기</Button>}>
```

- `DropdownMenu.Item`은 클릭하면 메뉴를 닫는다. 행/열 추가처럼 연속 조작이 자연스러운 경우에는 `closeOnClick={false}`
- 패널 안 커스텀 폼은 `DropdownMenu.useClose()`로 직접 닫는다 (툴바 테이블 삽입 폼)
- 외부 클릭(`mousedown`) 및 ESC 키를 감지해 자동으로 닫는다
- `align`: `'left' | 'right'`, `direction`: `'up' | 'down'`
- 사용처: `PostExportButtons`, 에디터 툴바 테이블 메뉴

## 간격

| 용도 | 값 |
|---|---|
| 섹션 간 | `py-16` 또는 `space-y-16` |
| 카드 목록 간격 | `gap-6` |
| 카드 내부 패딩 | `p-6` |
| 인라인 요소 간격 | `gap-2` 또는 `gap-3` |
