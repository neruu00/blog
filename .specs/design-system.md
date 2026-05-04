# 디자인 시스템 스펙

## 1. 디자인 방향

- **화이트 모던 디자인** — velog에서 영감
- **라이트 모드 only** (다크모드 없음)
- 상단 여백을 최대한 넓혀 y축으로 시원한 느낌
- 데스크톱에서 네비게이션은 사이드에 배치

---

## 2. 컬러 시스템

**Tailwind 기본 팔레트를 최대한 활용**하고, 기본 팔레트에 없는 값만 custom theme으로 정의한다.

### 퍼스널 컬러 (오렌지) — 기본 팔레트 사용
| 용도 | Tailwind 클래스 |
|---|---|
| 배경 하이라이트 | `orange-50` |
| 호버 배경 | `orange-100` |
| 서브 포인트 | `orange-400` |
| **메인 포인트** | `orange-500` |
| 호버 포인트 | `orange-600` |
| 액티브 포인트 | `orange-700` |

### 텍스트/보더 — 기본 팔레트 사용
| 용도 | Tailwind 클래스 |
|---|---|
| 본문 텍스트 | `gray-900` |
| 부가 텍스트 | `gray-500` |
| 비활성 텍스트 | `gray-400` |
| 기본 보더 | `gray-200` |
| 연한 보더 | `gray-100` |
| 에러/삭제 | `red-500` |
| 성공 | `green-500` |

### Custom Theme 토큰 — 기본 팔레트 외 값
| 토큰 | 값 | 용도 |
|---|---|---|
| `surface` | `#ffffff` | 기본 배경 |
| `surface-alt` | `#fafafa` | 대안 배경 (gray-50과 미세 차이) |
| `code-bg` | `#f8f9fa` | 코드 블록 배경 |

---

## 3. 타이포그래피

| 용도 | 폰트 | Tailwind 클래스 |
|---|---|---|
| 본문 | Pretendard Variable | `font-sans` |
| 코드 | Geist Mono | `font-mono` |

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

---

## 4. 에디터 전용 스타일

### 테이블 (Table)
- **헤더 (`th`)**: `bg-orange-100`, `text-orange-900`, `text-center`, `font-semibold`
- **셀 (`td`)**: `py-1` (높이 약 24px 목표), `text-gray-900`, `vertical-align: middle`
- **줄무늬**: 짝수 행 `bg-gray-50`
- **포커스**: 선택된 셀 `bg-orange-100`

### 에디터 푸터 (Fixed Footer)
- `position: fixed; bottom: 0`, `z-index: 50`
- `bg-white/80 backdrop-blur-md border-t border-gray-200`
- 에디터 하단에 `pb-24`를 두어 콘텐츠가 푸터에 가려지지 않도록 보장


---

## 4. 레이아웃

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
│   Portfolio│                                         │
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

### 사이드 네비게이션 항목
- 로고 / 프로필 아바타
- Home
- Posts
- Portfolio
- (Admin인 경우) Write 버튼

---

## 5. 컴포넌트 스타일 기준

### 버튼 (Buttons)
| 종류 | 스타일 | 예시 |
|---|---|---|
| Primary | `bg-orange-500 text-white hover:bg-orange-600` | 발행, 수정 |
| Secondary | `bg-white border border-gray-200 text-gray-900 hover:bg-gray-50` | 취소 |
| Ghost | `text-gray-500 hover:text-orange-500 hover:bg-orange-50` | 메뉴 |
| Danger | `bg-red-500 text-white hover:bg-red-600` | 삭제 |
| **IconButton** | `p-2 rounded-lg transition-colors` (ghost/danger) | 툴바, 삭제 아이콘 |

### 카드 (Cards)
```
bg-white border border-gray-200 rounded-lg shadow-sm
hover:shadow-md transition-shadow duration-200
```

### 입력 필드 (Inputs)
```
bg-white border border-gray-200 rounded-lg px-4 py-2
focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none
```

### 태그/뱃지 (TagBadge)
- **Primary**: `bg-orange-50 text-orange-600` (활성/포인트)
- **Solid**: `bg-gray-100 text-gray-600` (일반 카드)
- **Default**: `bg-gray-50 text-gray-500` (보조)
- **스타일**: `text-xs font-medium px-2.5 py-0.5 rounded-full`


---

## 6. 간격 기준

| 용도 | 값 |
|---|---|
| 섹션 간 | `py-16` 또는 `space-y-16` |
| 카드 목록 간격 | `gap-6` |
| 카드 내부 패딩 | `p-6` |
| 인라인 요소 간격 | `gap-2` 또는 `gap-3` |
