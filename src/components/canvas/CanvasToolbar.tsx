import { MousePointer2, Minus, ArrowUpRight, Square, LocateFixed, Save } from 'lucide-react';
import { ShapeType } from './types';

const COLORS = ['#000000', '#df4b26', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'];

interface CanvasToolbarProps {
  tool: Exclude<ShapeType, 'text'> | 'move';
  setTool: (t: Exclude<ShapeType, 'text'> | 'move') => void;
  color: string;
  setColor: (c: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
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
      <button
        type="button"
        onClick={() => setTool('move')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
          tool === 'move' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'
        }`}
        title="이동 (1)"
      >
        <MousePointer2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTool('straightLine')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
          tool === 'straightLine' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'
        }`}
        title="직선 (2)"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTool('arrow')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
          tool === 'arrow' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'
        }`}
        title="화살표 (3)"
      >
        <ArrowUpRight size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTool('rect')}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${
          tool === 'rect' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'
        }`}
        title="네모 (4)"
      >
        <Square size={16} />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-neutral-700 mx-1"></div>

      <div className="flex items-center gap-1">
        {COLORS.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setColor(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
              color === c ? 'border-orange-500' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
            title={c}
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
