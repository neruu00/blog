import { Hand, ArrowUpRight, Minus, MousePointer2, Square, Undo2, LocateFixed, Circle as CircleIcon, Save } from 'lucide-react';

import { ShapeType } from './types';

const COLORS = ['#000000', '#df4b26', '#3b82f6', '#10b981'];

interface CanvasToolbarProps {
  tool: Exclude<ShapeType, 'text'> | 'select';
  setTool: (t: Exclude<ShapeType, 'text'> | 'select') => void;
  color: string;
  setColor: (c: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

interface ToolButtonProps {
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

function ToolButton({ icon, title, isActive, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
        isActive ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'
      }`}
      title={title}
    >
      {icon}
    </button>
  );
}

export function CanvasToolbar({
  tool,
  setTool,
  color,
  setColor,
  onSave,
  onCancel,
}: CanvasToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 items-center">
      <ToolButton icon={<MousePointer2 size={16} />} title="선택 (1)" isActive={tool === 'select'} onClick={() => setTool('select')} />
      <ToolButton icon={<Minus size={16} />} title="직선 (2)" isActive={tool === 'straightLine'} onClick={() => setTool('straightLine')} />
      <ToolButton icon={<ArrowUpRight size={16} />} title="화살표 (3)" isActive={tool === 'arrow'} onClick={() => setTool('arrow')} />
      <div className="flex items-center gap-1">
        <ToolButton icon={<Square size={16} />} title="네모 (4)" isActive={tool === 'rect'} onClick={() => setTool('rect')} />
        <ToolButton icon={<CircleIcon size={16} />} title="원형 (5)" isActive={tool === 'ellipse'} onClick={() => setTool('ellipse')} />
      </div>

      <div className="flex items-center gap-1 border-l border-gray-200 dark:border-neutral-700 pl-2 ml-1">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform ${
              color === c ? 'border-gray-500 scale-110' : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: c }}
            title={`색상: ${c}`}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 p-0 border-0 rounded cursor-pointer ml-1"
          title="Custom Color"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700 border border-transparent font-medium"
            title="취소"
          >
            <span className="hidden sm:inline">취소</span>
          </button>
        )}
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors bg-orange-500 text-white hover:bg-orange-600 shadow-sm font-medium"
            title="에디터에 저장"
          >
            <Save size={16} />
            <span className="hidden sm:inline">저장</span>
          </button>
        )}
      </div>
    </div>
  );
}
