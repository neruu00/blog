import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

import CustomCanvas from '../../canvas/CustomCanvas';
import { Shape } from '../../canvas/types';

export default function CanvasNodeView({ node, updateAttributes, editor, deleteNode }: NodeViewProps) {
  const isEditable = editor.isEditable;
  
  const [isOverlayOpen, setIsOverlayOpen] = useState(() => {
    return isEditable && (!node.attrs.shapes || node.attrs.shapes.length === 0);
  });

  const handleSave = (shapes: Shape[], stageScale: number, stageX: number, stageY: number) => {
    updateAttributes({ shapes, stageScale, stageX, stageY });
    setIsOverlayOpen(false);
  };

  const handleCancel = () => {
    setIsOverlayOpen(false);
    if ((!node.attrs.shapes || node.attrs.shapes.length === 0) && typeof deleteNode === 'function') {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper className="canvas-block my-6 flex justify-center" data-type="canvas">
      {/* Read-only inline canvas */}
      <div 
        onClick={() => {
          if (isEditable) setIsOverlayOpen(true);
        }}
        className={`relative transition-all duration-200 block ${isEditable ? "cursor-pointer hover:ring-4 ring-orange-400/30 rounded-xl" : ""}`}
        title={isEditable ? "클릭하여 캔버스 수정" : undefined}
      >
        <CustomCanvas
          initialShapes={node.attrs.shapes}
          initialScale={node.attrs.stageScale}
          initialX={node.attrs.stageX}
          initialY={node.attrs.stageY}
          isReadOnly={true}
        />
        {/* Helper overlay text on hover */}
        {isEditable && !isOverlayOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/5 transition-colors rounded-xl opacity-0 hover:opacity-100 z-10">
            <span className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm pointer-events-none">
              클릭하여 캔버스 수정하기
            </span>
          </div>
        )}
      </div>

      {/* Full-screen overlay portal when editing */}
      {isOverlayOpen && isEditable && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="animate-in fade-in zoom-in-95 duration-200 ease-out">
             <CustomCanvas
               initialShapes={node.attrs.shapes}
               initialScale={node.attrs.stageScale}
               initialX={node.attrs.stageX}
               initialY={node.attrs.stageY}
               isReadOnly={false}
               onSave={handleSave}
               onCancel={handleCancel}
             />
          </div>
        </div>,
        document.body
      )}
    </NodeViewWrapper>
  );
}
