'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Heading3,
  Workflow,
} from 'lucide-react';

import { uploadImage } from '@/actions/image';
import { convertToWebP } from '@/lib/image-converter';

// https://github.com/wooorm/lowlight
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash/Terminal' },
];

interface ToolbarProps {
  editor: Editor | null;
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  // 버튼 스타일을 통합 관리하는 헬퍼 함수
  const getButtonClass = (isActive: boolean) =>
    `p-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-orange-100 text-orange-600' // 활성화 상태: 오렌지 포인트
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900' // 기본 상태
    }`;

  const handleImageUpload = async () => {
    // 가장 심플한 파일 선택 방식 (input 태그 동적 생성)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // WebP로 변환 (용량 최적화)
        const webpFile = await convertToWebP(file);

        const formData = new FormData();
        formData.append('file', webpFile);

        // 1. 업로드 중인 스켈레톤 먼저 삽입
        // base64로 미리보기 기능을 넣을 수도 있지만, 여기서는 단순 스켈레톤만 표시
        editor
          ?.chain()
          .focus()
          .setImage({
            src: '', // 아직 URL이 없음
            uploading: true,
          })
          .run();

        // 서버 액션 호출하여 업로드
        const result = await uploadImage(formData);

        if (result.success && result.url) {
          // 2. 성공 시 스켈레톤을 실제 이미지로 교체
          // Tiptap의 트랜잭션을 사용하여 현재 로딩 중인 이미지를 찾아 업데이트
          editor.view.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.uploading === true) {
              editor
                .chain()
                .setNodeSelection(pos)
                .updateAttributes('image', {
                  src: result.url,
                  uploading: false,
                })
                .focus()
                .run();
              return false; // 중단
            }
          });
        } else {
          // 업로드 실패 시 스켈레톤 제거
          editor.view.state.doc.descendants((node, pos) => {
            if (node.type.name === 'image' && node.attrs.uploading === true) {
              editor.chain().setNodeSelection(pos).deleteSelection().run();
              return false;
            }
          });
          alert(result.error);
        }
      } catch (error) {
        console.error('이미지 변환/업로드 중 오류:', error);
        alert('이미지 처리 중 오류가 발생했습니다.');
      }
    };
    input.click();
  };

  return (
    <div className="sticky top-0 z-40 flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={getButtonClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" /> {/* 구분선 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={getButtonClass(editor.isActive('codeBlock'))}
        title="Code Block"
      >
        <Code className="h-5 w-5" />
      </button>
      {/* Mermaid 확장 도구 모음 */}
      <button
        type="button"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'mermaidBlock',
              attrs: {
                code: 'graph TD;\n  A[Start] --> B{Decision};\n  B -->|Yes| C[Result 1];\n  B -->|No| D[Result 2];',
              },
            })
            .run()
        }
        className={getButtonClass(editor.isActive('mermaidBlock'))}
        title="Insert Diagram (Mermaid)"
      >
        <Workflow className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={handleImageUpload}
        className="rounded p-1.5 text-gray-500 hover:bg-gray-200 hover:text-orange-500 dark:text-neutral-400 dark:hover:bg-neutral-800"
        title="Upload Image"
      >
        <ImageIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={getButtonClass(editor.isActive('blockquote'))}
        title="Blockquote"
      >
        <Quote className="h-5 w-5" />
      </button>
      <div className="mx-1 h-6 w-px bg-gray-200" /> {/* 구분선 */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive('orderedList'))}
        title="Ordered List"
      >
        <ListOrdered className="h-5 w-5" />
      </button>
    </div>
  );
}
