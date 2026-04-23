# 컴포넌트 설계 규칙

## 1. 서버 컴포넌트 우선 원칙

- **기본은 서버 컴포넌트**. `'use client'`는 명시적으로 필요한 경우에만 사용.
- 클라이언트 바운더리는 **인터랙션이 필요한 최소 리프 컴포넌트**에만 적용.

```
✅ 올바른 구조:
ServerComponent (page.tsx)
  └── ServerComponent (PostList)
        ├── ServerComponent (PostCard) — 순수 표시
        └── ClientComponent (LikeButton) — 클릭 인터랙션

❌ 잘못된 구조:
ClientComponent (page.tsx) — 페이지 전체를 클라이언트로
  └── ClientComponent (PostList)
        └── ClientComponent (PostCard)
```

### `'use client'`가 필요한 경우
- `useState`, `useEffect`, `useRef` 등 React 훅 사용
- 이벤트 핸들러 (`onClick`, `onChange` 등)
- 브라우저 API 접근 (`window`, `document`)
- Zustand 스토어 구독
- TanStack Query 훅 사용

---

## 2. Compound Pattern

### 적용 대상
`Modal`, `Card`, `Sidebar`, `Dropdown` 등 복합 UI 컴포넌트

### 구조

```
components/ui/Modal/
├── index.ts          # 내보내기 진입점
├── Modal.tsx         # Root (Context Provider)
├── ModalTrigger.tsx  # 열기 버튼
├── ModalContent.tsx  # 오버레이 + 컨텐츠 래퍼
├── ModalHeader.tsx   # 제목 영역
├── ModalBody.tsx     # 본문 영역
├── ModalFooter.tsx   # 하단 버튼 영역
├── ModalClose.tsx    # 닫기 버튼
└── ModalContext.ts   # 공유 Context
```

### 사용 예시

```tsx
<Modal>
  <Modal.Trigger>열기</Modal.Trigger>
  <Modal.Content>
    <Modal.Header>제목</Modal.Header>
    <Modal.Body>본문 내용</Modal.Body>
    <Modal.Footer>
      <Modal.Close>닫기</Modal.Close>
    </Modal.Footer>
  </Modal.Content>
</Modal>
```

### 규칙
- 서브 컴포넌트는 `Context`로 부모 상태를 공유 (props drilling 금지)
- 각 서브 컴포넌트는 독립 파일로 분리
- `index.ts`에서 합성하여 내보내기:

```typescript
// components/ui/Modal/index.ts
import Modal from './Modal';
import ModalBody from './ModalBody';
import ModalClose from './ModalClose';
import ModalContent from './ModalContent';
import ModalFooter from './ModalFooter';
import ModalHeader from './ModalHeader';
import ModalTrigger from './ModalTrigger';

export default Object.assign(Modal, {
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});
```

---

## 3. Props 규칙

- Props 인터페이스는 컴포넌트 바로 위에 선언
- `children`이 필요하면 `React.ReactNode` 사용
- 선택적 props에는 기본값을 구조분해에서 설정

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}: ButtonProps) { ... }
```

---

## 4. 컴포넌트 디렉토리 분류

| 디렉토리 | 용도 | 예시 |
|---|---|---|
| `components/ui/` | 재사용 가능한 범용 컴포넌트 | Modal, Button, Card |
| `components/post/` | 게시글 관련 도메인 컴포넌트 | PostCard, CommentSection |
| `components/editor/` | Tiptap 에디터 관련 | TiptapEditor, Toolbar |
| `components/layout/` | 레이아웃 구성 요소 | SideNav, Header, Footer |
