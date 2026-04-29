# 스타일링 규칙

## 1. 컬러 사용 원칙

**Tailwind CSS 기본 팔레트를 최대한 활용한다.** 기본 팔레트에 없는 값이 필요할 때만 `globals.css`의 `@theme inline`에 커스텀 토큰을 정의한다.

### 퍼스널 컬러
- **오렌지 계열** — Tailwind 기본 `orange-*` 팔레트 사용
- 메인 포인트: `orange-500` (`#f97316`)

```html
<!-- ✅ 기본 팔레트 사용 -->
<button class="bg-orange-500 hover:bg-orange-600 text-white">
<p class="text-gray-900">
<div class="border-gray-200 bg-white">
<span class="text-gray-500">

<!-- ✅ 기본 팔레트에 없는 시맨틱 토큰은 custom theme -->
<div class="bg-surface-alt">  <!-- #fafafa — gray-50(#f9fafb)과 미묘하게 다른 값 -->
```

### Custom Theme 사용 기준
| 상황 | 사용 방식 |
|---|---|
| 기본 팔레트에 있는 값 | `orange-500`, `gray-200` 등 기본 클래스 사용 |
| 기본 팔레트에 없는 값 | `@theme inline`에 커스텀 토큰 정의 |
| 시맨틱 의미 부여 필요 | 커스텀 토큰 정의 (예: `surface`, `code-bg`) |

---

## 2. 커스텀 컬러 토큰 (globals.css)

기본 팔레트에 없거나 시맨틱 의미가 필요한 값만 정의한다.

```css
@theme inline {
  /* 시맨틱 배경 — 기본 팔레트에 정확히 매칭되지 않는 값 */
  --color-surface: #ffffff;
  --color-surface-alt: #fafafa;

  /* 코드 블록 배경 */
  --color-code-bg: #f8f9fa;

  /* 폰트 */
  --font-sans: 'Pretendard Variable', 'Pretendard', sans-serif;
  --font-mono: var(--font-geist-mono);
}
```

### 기본 팔레트 매핑 가이드

| 용도 | Tailwind 클래스 |
|---|---|
| 메인 포인트 | `orange-500` |
| 포인트 호버 | `orange-600` |
| 포인트 배경 | `orange-50` |
| 본문 텍스트 | `gray-900` |
| 부가 텍스트 | `gray-500` |
| 비활성 텍스트 | `gray-400` |
| 기본 보더 | `gray-200` |
| 연한 보더 | `gray-100` |
| 에러/삭제 | `red-500` |
| 성공 | `green-500` |

---

## 3. 다크모드

**라이트 모드 only**. 다크모드 관련 코드를 작성하지 않는다.

```html
<!-- ❌ 다크모드 클래스 사용 금지 -->
<div class="bg-white dark:bg-gray-900">

<!-- ✅ 라이트 모드만 -->
<div class="bg-white">
```

---

## 4. 타이포그래피

- 본문: `font-sans` (Pretendard)
- 코드: `font-mono` (Geist Mono)
- 기존 `font-marker` (Nanum Pen Script) → 제거

---

## 5. 레이아웃 유틸리티

| 용도 | 클래스 |
|---|---|
| 콘텐츠 최대 너비 | `max-w-3xl` (768px) |
| 좌우 패딩 | `px-6` |
| 섹션 간격 | `space-y-8` 또는 `gap-8` |
| 카드 라운딩 | `rounded-lg` |
| 그림자 | `shadow-sm` (기본), `shadow-md` (강조) |

---

## 6. 반응형 브레이크포인트

| 브레이크포인트 | 용도 |
|---|---|
| `< 768px` (모바일) | 사이드 네비 숨김, 햄버거 메뉴 |
| `768px ~ 1024px` (태블릿) | 사이드 네비 축소 |
| `≥ 1024px` (데스크톱) | 사이드 네비 펼침 |

---

## 7. 애니메이션

- Tailwind `transition-*` 유틸리티 사용
- 복잡한 애니메이션은 `@keyframes` + `animation-*`으로 `globals.css`에 정의
- 기본 트랜지션: `transition-colors duration-200`
- 호버 효과: `hover:bg-accent-50`, `hover:text-accent-500`
