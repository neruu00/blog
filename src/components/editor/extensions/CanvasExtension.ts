import { Node, mergeAttributes, ReactNodeViewRenderer } from '@tiptap/react';
import CanvasNodeView from './CanvasNodeView';

export const CanvasExtension = Node.create({
  name: 'canvas',
  group: 'block',
  atom: true, // Treat as a single inseparable block

  addAttributes() {
    return {
      shapes: {
        default: [],
      },
      stageScale: {
        default: 1,
      },
      stageX: {
        default: 0,
      },
      stageY: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="canvas"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'canvas' })];
  },

  addKeyboardShortcuts() {
    const confirmDelete = () => {
      const { state } = this.editor;
      const { selection } = state;
      
      let containsCanvas = false;
      
      if (selection && 'node' in selection && (selection as any).node?.type.name === 'canvas') {
        containsCanvas = true;
      } else if (!selection.empty) {
        state.doc.nodesBetween(selection.from, selection.to, (node) => {
          if (node.type.name === 'canvas') {
            containsCanvas = true;
          }
        });
      }

      if (containsCanvas) {
        if (window.confirm('캔버스를 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)')) {
          return false; // let the editor delete
        }
        return true; // prevent deletion
      }
      return false;
    };

    return {
      Backspace: confirmDelete,
      Delete: confirmDelete,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CanvasNodeView);
  },
});
