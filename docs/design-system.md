# 디자인 시스템

> **스코프**: 컬러, 타이포그래피, 레이아웃, 컴포넌트 스타일 레시피.
> 스타일 **규칙**(3단 텍스트 계층, 플랫 원칙, 임의 hex 금지 등)의 원본은 저장소 `AGENTS.md` 스타일링 섹션이다. 여기는 구체 값을 담는다.

## 디자인 방향

- **화이트 모던** — velog에서 영감. **라이트 모드 only** (다크모드 없음, `dark:` 클래스 금지)
- 상단 여백을 최대한 넓혀 y축으로 시원한 느낌
- 데스크톱 네비게이션은 사이드 배치

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

텍스트 3단 계층(`gray-900`/`gray-500`/`gray-400`)과 보더 색(`gray-100`/`gray-200`)은 `AGENTS.md` 스타일링 섹션이 원본이다.

### Custom Theme 토큰 — 기본 팔레트 외 값

| 토큰 | 값 | 용도 |
|---|---|---|
| `surface` | `#ffffff` | 기본 배경 |
| `surface-alt` | `#fafafa` | 대안 배경 (gray-50과 미세 차이) |
| `code-bg` | `#f8f9fa` | 코드 블록 배경 |

## 타이포그래피

| 용도 | 폰트 | Tailwind 클래스 |
|---|---|---|
| 본문 | Pretendard Variable | `font-sans` |
| 코드 | Geist Mono | `font-mono` |

**기울임(`italic`)은 쓰지 않는다.** Pretendard에 이탤릭 자체가 없어 브라우저 합성 oblique가 나오고, 한글에서 특히 뭉개진다. 강조는 굵기·색으로 한다.

**텍스트 선택색은 `orange-100`** (`::selection`, 전역). 코드블록만 다크 표면이라 `orange-500/30`을 따로 쓴다.

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
- 페이지별 인라인 `prose-*` 체인을 만들지 않는다 (뉴스 상세의 개별 체인은 2026-08-20 제거)
- `prose` 클래스가 붙는 곳은 세 군데뿐: `PostContent`(게시글 읽기, 서버), 뉴스 상세의 `ReactMarkdown` 래퍼, `TiptapEditor`의 ProseMirror 요소(편집). **한 본문에 두 번 겹치지 않는다** — 안쪽 `.prose`가 자기 `font-size: 1rem`을 다시 선언해 바깥 `prose-lg`를 죽인다. 게시글 상세가 옛 뷰어 시절 이 상태로 오래 있었다

**오버라이드가 왜 이기는가**: `globals.css`의 `.prose` 규칙은 `@layer` **밖**에 있고, typography 플러그인 규칙은 `@layer utilities` 안에 있다. 레이어 밖 스타일은 특이도와 무관하게 항상 레이어 안을 이긴다. 게다가 플러그인은 자기 선택자를 `:where()`로 감싸 특이도를 `(0,1,0)`으로 눌러 둔다. **따라서 `.prose` 오버라이드에는 `!important`도, 긴 선택자도 쓰지 않는다** — 과거 헤딩·테이블·인라인 코드 규칙에 붙어 있던 `!important` 20여 개는 전부 불필요해서 제거했다. `.prose li > p`면 충분하다.

**읽기 본문 글자색은 `gray-700`이다.** typography가 `--tw-prose-body`로 `.prose` 요소에 직접 선언하므로 감싸는 div의 `text-gray-900`은 본문에 닿지 않는다. 장문 가독성으로 700이 적절해 그대로 둔다 — 컴포넌트 텍스트 3단(900/500/400)과는 별개의 읽기 전용 값이다. 헤딩은 `--tw-prose-headings` = gray-900.

**링크는 `orange-700`.** `prose-orange` 기본값 orange-600은 흰 배경 대비 3.6:1로 AA 미달이다 — `.prose { --tw-prose-links }`로 덮는다. TagBadge·인라인 코드가 700으로 간 것과 같은 결정.

> 📌 **현재 본문 크기가 갈려 있다**: 뉴스 상세는 `prose-lg`(18px), 게시글 상세(`PostContent`)는 16px다. 통일하려면 `PostContent`의 래퍼에 `prose-lg`를 넣거나(→ 둘 다 18px), 뉴스 상세에서 `prose-lg`를 빼면(→ 둘 다 16px) 된다. 편집 화면(`TiptapEditor`)은 16px이므로 18로 올리면 편집·읽기 크기가 달라진다는 점을 감안할 것.

### 목록 (ul / ol)

Tiptap의 listItem은 항상 `<li><p>…</p></li>`로 렌더링된다. typography는 li 안 문단의 `:first-child`에 위 마진, `:last-child`에 아래 마진을 `1.25em`씩 주는데, **문단이 하나뿐이라 같은 `<p>`가 양쪽 규칙을 동시에 맞는다.** 여기에 `li` 자체 마진까지 얹혀 항목 간격이 의도의 두세 배가 됐다.

| 항목 | 값 | 비고 |
|---|---|---|
| `li > p` 위·아래 마진 | `0` | 위 문제의 실제 수정 지점 |
| `li > p + p` | `0.75em` | 문단이 여럿인 항목만 사이를 띄운다 |
| `li` 위·아래 마진 | `0.25em` | 항목 간격 |
| `ul`/`ol` 들여쓰기 | `padding-inline-start: 1.5em` | 본문과 구분되도록 (typography 기본 1.625em) |
| 중첩 목록 마진 | `0.25em` | |

**마커는 `color: inherit` — 본문과 같은 색이다.** 구분은 들여쓰기가 맡으므로 색으로 튀게 하지 않는다. (`orange-400` 불릿을 시도했다가 되돌렸다.)

### 인용·주석 블록 (blockquote)

플랫 원칙대로 **테두리 없이 배경만** 쓴다 — `bg-orange-50`, `rounded-xl`, `padding: 1rem 1.25rem`, 본문 `gray-500`.

- 기울임 제거 (위 폰트 항목 참조). typography 기본값인 `font-weight: 500`도 400으로 되돌린다
- `> **주의**` 같은 머리말이 묻히지 않게 `blockquote strong`만 `gray-900`
- `gray-500` on `orange-50`은 4.55:1로 AA를 통과한다. 더 밝은 회색으로 내리지 마라

### 테이블

플랫 원칙: **세로선·전체 격자 없이 가로 구분선만.** 전에는 모든 셀에 1px 테두리 + orange-100 헤더 + 짝수행 배경이 하드코딩 hex와 `!important`로 박혀 있었다.

| 요소 | 스타일 |
|---|---|
| 셀 (`th`, `td`) | `padding: 0.625rem 0.75rem`, 좌측 정렬, `border-bottom: 1px gray-100` |
| 헤더 (`th`) | `bg-gray-50 text-gray-900 font-semibold` |
| 마지막 행 | 아래 구분선 없음 |
| 글자 | `text-sm`, `line-height: 1.5`, 셀 안 `p` 마진 0 |

**Tiptap 테이블에는 `thead`가 없다** — 첫 행이 `<th>`로 `tbody` 안에 있다. typography의 `thead th` 규칙이 닿지 않으므로 `.prose th`를 직접 잡는다.

**넓은 표는 `.tableWrapper` 안에서만 스크롤한다.** 에디터는 `resizable: true` 노드뷰가 표를 `<div class="tableWrapper">`로 감싸고, 읽기 화면은 `PostContent`의 `table` 매핑이 같은 래퍼를 직접 만든다. 이 클래스에 `overflow-x: auto`가 없으면 모바일에서 페이지 전체가 가로로 밀린다. 표 바깥 마진(`1.5rem 0`)은 래퍼가 가진다.

### 인라인 코드

`bg-gray-100` + `text-orange-700`. **orange-600은 gray-100 위에서 3.2:1로 AA 미달**이라 700으로 올렸다 — TagBadge가 orange-700으로 간 것과 같은 이유다.

### 코드블록

다크 표면(`code-block` 토큰) + Mac 헤더는 의도된 대비 요소다. 프레임 마크업은 `CodeBlockFrame` 하나가 단일 출처 — 에디터 NodeView와 읽기 화면(`StaticCodeBlock`)이 공유한다. **그림자는 쓰지 않는다** — 배경 대비만으로 충분히 구분되고, "그림자는 떠 있는 요소에만" 규칙의 예외가 아니다. 구문 강조 테마는 `layout.tsx`가 `highlight.js/styles/atom-one-dark.css`를 전역으로 로드한다.

## 에디터 전용 스타일

### 테이블

- **헤더 (`th`)**: `bg-orange-100`, `text-orange-900`, `text-center`, `font-semibold`
- **셀 (`td`)**: `py-1` (높이 약 24px 목표), `text-gray-900`, `vertical-align: middle`
- **줄무늬**: 짝수 행 `bg-gray-50`
- **포커스**: 선택된 셀 `bg-orange-100`

### 에디터 푸터 (Fixed Footer)

- `position: fixed; bottom: 0`, `z-index: 50`
- `bg-white/80 backdrop-blur-md border-t border-gray-200`
- 에디터 하단에 `pb-24`를 두어 콘텐츠가 푸터에 가려지지 않게 보장

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
- 글쓰기 진입은 사이드 네비가 아니라 `FloatingActionButton`(admin 전용)이 담당

## 컴포넌트 스타일

### 버튼 (Button)

**모든 버튼은 `ui/Button` 하나를 쓴다.** 페이지 안에서 `<button className="bg-orange-500 …">`를 다시 만들지 않는다.

`href`를 주면 `next/link`로, 없으면 `<button type="button">`으로 렌더링한다. `className`은 `cn`(tailwind-merge)으로 병합되므로 개별 override가 안전하다.

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

**토글은 `aria-pressed`로 표현한다.** `ghost`에 `aria-pressed:bg-orange-100 aria-pressed:text-orange-600`이 들어 있어, 에디터 툴바·Mermaid Code/Preview 토글이 별도 variant 없이 활성 스타일을 얻는다. 상태가 접근성 트리에도 함께 올라간다.

```tsx
<Button variant="ghost" size="icon" aria-pressed={editor.isActive('bold')} title="Bold">
  <Bold className="h-5 w-5" />
</Button>
```

에러/404 페이지의 주 액션도 `primary`(orange)를 쓴다 — 그 자리의 gray-900 다크 버튼은 폐기됐다.

**커서는 컴포넌트가 아니라 `globals.css`가 전역으로 정한다**: `button:not(:disabled), select:not(:disabled)` → `pointer`, `button:disabled` → `not-allowed`. 컴포넌트마다 `cursor-pointer`를 붙이지 않는다.

**폐기된 것**
- `ui/IconButton` — `Button size="icon"`으로 흡수됐다. ghost hover가 `gray-50`/`gray-100`으로 갈라져 있던 드리프트가 원인. danger는 `variant="ghost"` + `text-red-500 hover:bg-red-50`
- `secondary`(gray-900 솔리드), `link` variant — 각각 사용처가 하나뿐이라 제거했다. 본문 텍스트 링크는 그냥 `<Link className="text-orange-500 hover:underline">`

### Button을 쓰지 않는 예외

- `layout/ProfileButton` — 사이드바 '행'이라 NavLinks와 같은 형태다. Button으로 감싸면 오버라이드가 variant보다 길어진다
- `layout/FloatingActionButton`, `common/Pagination`, `ui/FilterChip` — FAB·페이지 링크·필터 알약 각각의 고유 형태
- `editor/TagInputField`의 태그 칩 안 X, `ui/DropdownMenu.Item` — 상위 컴포넌트에 종속된 내부 요소

### 카드

목록 카드(PostCard, NewsCard)는 박스가 아니라 **플랫 리스트 항목**이다. 컨테이너의 `divide-y divide-gray-100`으로 구분하고, hover는 제목 색 전환(`group-hover:text-orange-500`)으로 표현한다. 테두리·그림자·배경 박스를 쓰지 않는다.

그림자는 떠 있거나 고정된 요소에만 — sticky 툴바, EditorFooter, FAB, 모달, 드롭다운.

### 홈 포스터

- 시그니처는 `EyePoster`(방범카메라) 하나 — 마우스 추적 눈동자 + 「作動中!」. `h-64 border-gray-200 bg-gray-100`
- 마우스 전용/장식 요소라 **md 미만에서는 숨긴다**
- 홈은 시각적 제목 없이 포스터(1/5) + 최신 뉴스(4/5)로 시작한다 — 문서 아웃라인용 `sr-only` h1만 둔다

### 입력 필드

```
bg-white border border-gray-200 rounded-lg px-4 py-2
focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
```

키보드 포커스는 `globals.css`의 전역 규칙(`a:focus-visible, button:focus-visible` → orange-500 아웃라인 2px)이 담당한다.

### 태그/뱃지 (TagBadge)

- **단일 스타일**: `rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700` — 컴팩트 스퀘어, 테두리 없음 (플랫 원칙)
- 텍스트는 `orange-700` — orange-600은 orange-50 배경 대비 3.3:1로 12px 텍스트 AA(4.5:1) 미달이라 승격했다
- 게시글 기술 태그와 뉴스 소스 라벨이 같은 컴포넌트를 쓴다
- `tag` prop에 `#` 접두사가 없으면 자동으로 붙인다. 뉴스 소스 라벨은 `hash={false}`
- variant 체계는 제거됨 — 실사용이 primary 한 종뿐이었다

### 스켈레톤 (Skeleton)

- **모든 로딩 스켈레톤은 `ui/Skeleton` 하나를 쓴다**: `animate-pulse rounded-md bg-gray-100`
- 크기·모양은 `className`으로 덮어쓴다 (`cn`이 tailwind-merge라 `rounded-full` 등 override 가능)
- 동적 너비 등 런타임 계산값만 `style` prop으로 — 과거 인라인 `animate-pulse` div가 gray-100/gray-200으로 갈라져 있던 드리프트를 이 컴포넌트로 수렴했다

### 드롭다운 (DropdownMenu)

- Context 기반 합성 컴포넌트 패턴 (`DropdownMenu` + `DropdownMenu.Item`)
- **`trigger`는 render prop이다.** 받은 `onClick`/`aria-expanded`를 실제 버튼에 펼쳐야 한다 — 과거 `<div role="button">` 래퍼가 버튼을 감싸 접근성 트리에 버튼이 둘로 보이던 문제를 없앴다

```tsx
<DropdownMenu trigger={(props) => <Button variant="outline" {...props}>내보내기</Button>}>
```

- `DropdownMenu.Item`은 클릭 시 메뉴를 닫는다. 행/열 추가처럼 연속 조작이 자연스러우면 `closeOnClick={false}`
- 패널 안 커스텀 폼은 `DropdownMenu.useClose()`로 직접 닫는다 (툴바 테이블 삽입 폼)
- 외부 클릭(`mousedown`) 및 ESC 키 감지로 자동 닫기
- `align`: `'left' | 'right'`, `direction`: `'up' | 'down'`
- 사용처: `PostExportButtons`, 에디터 툴바 테이블 메뉴

## 간격

| 용도 | 값 |
|---|---|
| 섹션 간 | `py-16` 또는 `space-y-16` |
| 카드 목록 간격 | `gap-6` |
| 카드 내부 패딩 | `p-6` |
| 인라인 요소 간격 | `gap-2` 또는 `gap-3` |
