'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Arrow, Text, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import { MousePointer2, Minus, ArrowUpRight, Square, Undo2, LocateFixed } from 'lucide-react';

type ShapeType = 'rect' | 'straightLine' | 'arrow' | 'text';

type Shape = {
  id: string;
  type: ShapeType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: number[];
  text?: string;
  fontSize?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
};

const COLORS = ['#000000', '#df4b26', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'];

export default function CustomCanvas() {
  const [tool, setTool] = useState<Exclude<ShapeType, 'text'> | 'move'>('straightLine');
  const [color, setColor] = useState('#000000');
  
  // History for Undo
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const shapes = history[historyStep];

  const isDrawing = useRef(false);

  // Zoom and Pan
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);

  // Text Editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });

  // Focus selection
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);

  useEffect(() => {
    if (selectedId && trRef.current && layerRef.current) {
      const node = layerRef.current.findOne(`#${selectedId}`);
      if (node) {
        trRef.current.nodes([node]);
        trRef.current.getLayer()?.batchDraw();
      } else {
        trRef.current.nodes([]);
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, shapes]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setSelectedId(null);
    }
  }, [historyStep]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'Backspace':
        case 'Delete':
          if (selectedId) {
            e.preventDefault();
            const currentShapes = [...history[historyStep]];
            const newShapes = currentShapes.filter(s => s.id !== selectedId);
            const newHistory = history.slice(0, historyStep + 1);
            newHistory.push(newShapes);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
            setSelectedId(null);
          }
          break;
        case '1': setTool('move'); break;
        case '2': setTool('straightLine'); break;
        case '3': setTool('arrow'); break;
        case '4': setTool('rect'); break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, selectedId, history, historyStep]);

  const handleReturnToContent = () => {
    setStageScale(1);
    setStageX(0);
    setStageY(0);
  };

  const getRelativePointerPosition = (stage: Konva.Stage) => {
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return null;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pointerPosition);
  };

  const commitShapes = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, shapeId: string) => {
    e.cancelBubble = true;
    const node = e.target;
    const currentShapes = [...history[historyStep]];
    const index = currentShapes.findIndex(s => s.id === shapeId);
    if (index !== -1) {
      currentShapes[index] = { 
        ...currentShapes[index], 
        x: node.x(), 
        y: node.y() 
      };
      commitShapes(currentShapes);
    }
  };

  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target === e.target.getStage()) {
      setStageX(e.target.x());
      setStageY(e.target.y());
    }
  };

  const handleShapeSelect = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    if (tool === 'move') {
      setSelectedId(id);
      e.cancelBubble = true;
    }
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      setSelectedId(null);
    }

    if (editingTextId) {
      setEditingTextId(null);
      return;
    }
    
    if (tool === 'move') return;
        
    isDrawing.current = true;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const id = Date.now().toString();

    let newShape: Shape;
    if (tool === 'straightLine' || tool === 'arrow') {
      newShape = { id, type: tool, x: 0, y: 0, points: [pos.x, pos.y, pos.x, pos.y], stroke: color, strokeWidth: 2 };
    } else if (tool === 'rect') {
      newShape = { id, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, stroke: color, strokeWidth: 2 };
    } else {
      return;
    }
    
    setSelectedId(id);
    commitShapes([...shapes, newShape]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current || tool === 'move') return;

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const currentShapes = [...history[historyStep]];
    let lastShape = { ...currentShapes[currentShapes.length - 1] };

    if ((tool === 'straightLine' || tool === 'arrow') && lastShape.points) {
      lastShape.points = [lastShape.points[0], lastShape.points[1], pos.x, pos.y];
    } else if (tool === 'rect' && lastShape.type === 'rect') {
      lastShape.width = pos.x - (lastShape.x || 0);
      lastShape.height = pos.y - (lastShape.y || 0);
    }

    currentShapes[currentShapes.length - 1] = lastShape;
    const newHistory = [...history];
    newHistory[historyStep] = currentShapes;
    setHistory(newHistory);
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      
      // Clean up accidental 0-length clicks
      const currentShapes = [...history[historyStep]];
      const lastShape = currentShapes[currentShapes.length - 1];
      let isEmpty = false;
      if (lastShape) {
        if (lastShape.type === 'rect' && lastShape.width === 0 && lastShape.height === 0) {
          isEmpty = true;
        } else if ((lastShape.type === 'straightLine' || lastShape.type === 'arrow') && lastShape.points) {
          if (lastShape.points[0] === lastShape.points[2] && lastShape.points[1] === lastShape.points[3]) {
            isEmpty = true;
          }
        }
      }
      
      if (isEmpty) {
        currentShapes.pop();
        const newHistory = [...history];
        newHistory[historyStep] = currentShapes;
        setHistory(newHistory);
        // Clear selection since it didn't draw anything
        setSelectedId(null);
      }

      if (tool === 'straightLine' || tool === 'arrow' || tool === 'rect') {
        setTool('move');
      }
    }
  };

  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (e.target instanceof Konva.Text) {
      const targetId = e.target.id();
      const shape = shapes.find(s => s.id === targetId);
      if (shape && shape.type === 'text') {
        setEditingTextId(shape.id);
        setTextInputValue(shape.text || '');
        const absolutePos = e.target.getAbsolutePosition();
        setTextInputPos({ x: absolutePos.x, y: absolutePos.y });
        setSelectedId(null);
        setTool('move');
        return;
      }
    }
    
    if (e.target !== stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const id = Date.now().toString();
    const newShape: Shape = {
      id,
      type: 'text',
      x: pos.x,
      y: pos.y,
      text: '',
      fill: color,
      fontSize: 20,
    };

    setTool('move');
    commitShapes([...shapes, newShape]);
    
    const absolutePos = stage.getPointerPosition();
    if (absolutePos) {
      setEditingTextId(id);
      setTextInputValue('');
      setTextInputPos({ x: absolutePos.x, y: absolutePos.y });
      setSelectedId(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInputValue(e.target.value);
    
    if (editingTextId) {
      const currentShapes = [...history[historyStep]];
      const index = currentShapes.findIndex(s => s.id === editingTextId);
      if (index !== -1) {
        currentShapes[index] = { ...currentShapes[index], text: e.target.value };
        const newHistory = [...history];
        newHistory[historyStep] = currentShapes;
        setHistory(newHistory);
      }
    }
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStageX(pointer.x - mousePointTo.x * newScale);
    setStageY(pointer.y - mousePointTo.y * newScale);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm relative focus:outline-none" tabIndex={0}>
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 items-center">
        <button
          onClick={() => setTool('move')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${tool === 'move' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'}`}
          title="이동 (1)"
        >
          <MousePointer2 size={16} />
        </button>
        <button
          onClick={() => setTool('straightLine')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${tool === 'straightLine' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'}`}
          title="직선 (2)"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => setTool('arrow')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${tool === 'arrow' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'}`}
          title="화살표 (3)"
        >
          <ArrowUpRight size={16} />
        </button>
        <button
          onClick={() => setTool('rect')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${tool === 'rect' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-neutral-800 dark:text-gray-300'}`}
          title="네모 (4)"
        >
          <Square size={16} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-neutral-700 mx-1"></div>
        
        <div className="flex items-center gap-1">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-orange-500' : 'border-transparent'}`}
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
        
        <div className="ml-auto">
          <button
            onClick={handleReturnToContent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors bg-white text-gray-700 hover:bg-gray-100 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700"
            title="초기 위치로 돌아가기"
          >
            <LocateFixed size={16} />
            <span className="hidden sm:inline">초기 위치로</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Stage
          width={700}
          height={400}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDblClick={handleDblClick}
          onWheel={handleWheel}
          onDragEnd={handleStageDragEnd}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stageX}
          y={stageY}
          draggable={tool === 'move' && !editingTextId && !selectedId} 
          className={tool === 'move' ? (selectedId ? 'cursor-default' : 'cursor-grab active:cursor-grabbing') : 'cursor-crosshair'}
        >
          <Layer ref={layerRef}>
            {shapes.map((shape) => {
              const isSelected = selectedId === shape.id;
              
              if (shape.type === 'straightLine') {
                const xs = [shape.points![0], shape.points![2]];
                const ys = [shape.points![1], shape.points![3]];
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);

                return (
                  <Group
                    id={shape.id}
                    key={shape.id}
                    x={shape.x || 0}
                    y={shape.y || 0}
                    draggable={tool === 'move' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                  >
                    {isSelected && (
                      <Rect
                        x={minX - 10}
                        y={minY - 10}
                        width={Math.max(maxX - minX + 20, 20)}
                        height={Math.max(maxY - minY + 20, 20)}
                        fill="rgba(0,0,0,0)"
                      />
                    )}
                    <Line
                      points={shape.points}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      lineCap="round"
                      lineJoin="round"
                      hitStrokeWidth={15} 
                    />
                  </Group>
                );
              } else if (shape.type === 'arrow') {
                const xs = [shape.points![0], shape.points![2]];
                const ys = [shape.points![1], shape.points![3]];
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);

                return (
                  <Group
                    id={shape.id}
                    key={shape.id}
                    x={shape.x || 0}
                    y={shape.y || 0}
                    draggable={tool === 'move' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                  >
                    {isSelected && (
                      <Rect
                        x={minX - 15}
                        y={minY - 15}
                        width={Math.max(maxX - minX + 30, 30)}
                        height={Math.max(maxY - minY + 30, 30)}
                        fill="rgba(0,0,0,0)"
                      />
                    )}
                    <Arrow
                      points={shape.points!}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      fill={shape.stroke}
                      pointerLength={10}
                      pointerWidth={10}
                      lineCap="round"
                      lineJoin="round"
                      hitStrokeWidth={15}
                    />
                  </Group>
                );
              } else if (shape.type === 'rect') {
                return (
                  <Rect
                    id={shape.id}
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    fillEnabled={isSelected}
                    fill={isSelected ? 'rgba(0,0,0,0)' : undefined}
                    cornerRadius={2}
                    draggable={tool === 'move' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                    hitStrokeWidth={15}
                  />
                );
              } else if (shape.type === 'text') {
                return (
                  <Text
                    id={shape.id}
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    text={shape.text}
                    fontSize={shape.fontSize}
                    fill={shape.fill}
                    visible={editingTextId !== shape.id}
                    draggable={tool === 'move' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                    hitStrokeWidth={15}
                  />
                );
              }
            })} 
            
            {selectedId && (
              <Transformer
                ref={trRef}
                resizeEnabled={false}
                rotateEnabled={false}
                borderDash={[5, 5]}
                borderStroke="#3b82f6"
                borderStrokeWidth={1.5}
                enabledAnchors={[]}
                padding={8}
              />
            )}
          </Layer>
        </Stage>
        
        {editingTextId && (
          <textarea
            autoFocus
            value={textInputValue}
            onChange={handleTextChange}
            className="absolute bg-transparent border border-blue-500 border-dashed outline-none resize-none overflow-hidden text-black dark:text-white"
            style={{
              top: textInputPos.y,
              left: textInputPos.x,
              fontSize: `${20 * stageScale}px`,
              fontFamily: 'sans-serif',
              minWidth: `${100 * stageScale}px`,
              height: `${Math.max(1, textInputValue.split('\n').length) * 24 * stageScale + 10}px`, // multiline height adjustment
              lineHeight: 1.2,
              padding: 0,
              margin: 0,
              color: color,
            }}
            onBlur={() => {
              if (!textInputValue.trim()) {
                const currentShapes = [...history[historyStep]];
                const filteredShapes = currentShapes.filter(s => s.id !== editingTextId);
                const newHistory = [...history];
                newHistory[historyStep] = filteredShapes;
                setHistory(newHistory);
              }
              setTool('move');
              setEditingTextId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur();
              }
            }}
          />
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={handleUndo}
            disabled={historyStep === 0}
            className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 transition"
            title="실행 취소 (Ctrl+Z / Cmd+Z)"
          >
            <Undo2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}