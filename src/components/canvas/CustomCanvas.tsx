'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Arrow, Text, Transformer, Group, Circle } from 'react-konva';
import Konva from 'konva';
import { Undo2 } from 'lucide-react';

import { Shape, ShapeType } from './types';
import { CanvasToolbar } from './CanvasToolbar';

export interface CustomCanvasProps {
  initialShapes?: Shape[];
  initialScale?: number;
  initialX?: number;
  initialY?: number;
  isReadOnly?: boolean;
  onSave?: (shapes: Shape[], stageScale: number, stageX: number, stageY: number) => void;
  onCancel?: () => void;
}

const SNAP_DISTANCE = 20;

export default function CustomCanvas({
  initialShapes = [],
  initialScale = 1,
  initialX = 0,
  initialY = 0,
  isReadOnly = false,
  onSave,
  onCancel,
}: CustomCanvasProps) {
  const [tool, setTool] = useState<Exclude<ShapeType, 'text'> | 'move'>('straightLine');
  const [color, setColor] = useState('#000000');
  
  const [history, setHistory] = useState<Shape[][]>([initialShapes]);
  const [historyStep, setHistoryStep] = useState(0);

  const shapes = history[historyStep];

  const isDrawing = useRef(false);

  const [stageScale, setStageScale] = useState(initialScale);
  const [stageX, setStageX] = useState(initialX);
  const [stageY, setStageY] = useState(initialY);

  useEffect(() => {
    if (isReadOnly) {
      setHistory([initialShapes]);
      setStageScale(initialScale);
      setStageX(initialX);
      setStageY(initialY);
    }
  }, [isReadOnly, initialShapes, initialScale, initialX, initialY]);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [textInputPos, setTextInputPos] = useState({ x: 0, y: 0 });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isReadOnly) return;
    
    if (selectedId && trRef.current && layerRef.current) {
      const selectedShape = shapes.find(s => s.id === selectedId);
      if (selectedShape && (selectedShape.type === 'rect' || selectedShape.type === 'text')) {
        const node = layerRef.current.findOne(`#${selectedId}`);
        if (node) {
          trRef.current.nodes([node]);
          trRef.current.getLayer()?.batchDraw();
        } else {
          trRef.current.nodes([]);
        }
      } else {
        trRef.current.nodes([]);
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, shapes, isReadOnly]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0 && !isReadOnly) {
      setHistoryStep(historyStep - 1);
      setSelectedId(null);
    }
  }, [historyStep, isReadOnly]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isReadOnly) return;
    e.stopPropagation();

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
      const shape = currentShapes[index];
      
      if (shape.type === 'straightLine' || shape.type === 'arrow') {
        const nx = node.x();
        const ny = node.y();
        if (shape.points && (nx !== 0 || ny !== 0)) {
          currentShapes[index] = { 
            ...shape, 
            x: 0, 
            y: 0,
            points: [
              shape.points[0] + nx,
              shape.points[1] + ny,
              shape.points[2] + nx,
              shape.points[3] + ny
            ]
          };
          node.x(0);
          node.y(0);
        }
      } else {
        currentShapes[index] = { 
          ...shape, 
          x: node.x(), 
          y: node.y() 
        };
      }
      commitShapes(currentShapes);
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, shapeId: string) => {
    if (isReadOnly) return;
    const node = e.target;
    const currentShapes = [...history[historyStep]];
    const index = currentShapes.findIndex(s => s.id === shapeId);
    if (index !== -1) {
      currentShapes[index] = { 
        ...currentShapes[index], 
        x: node.x(), 
        y: node.y(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      };
      commitShapes(currentShapes);
    }
  };

  const findSnapPoint = (currentX: number, currentY: number, ignoreShapeId: string) => {
    let closestX = 0;
    let closestY = 0;
    let minDist = Infinity;
    
    shapes.forEach((s) => {
      if (s.id === ignoreShapeId) return;

      const pointsToTest: { x: number; y: number }[] = [];

      if (s.type === 'rect' && s.x !== undefined && s.y !== undefined && s.width !== undefined && s.height !== undefined) {
        const rx = s.x;
        const ry = s.y;
        const rw = s.width * (s.scaleX || 1);
        const rh = s.height * (s.scaleY || 1);
        
        pointsToTest.push({ x: rx, y: ry });
        pointsToTest.push({ x: rx + rw, y: ry });
        pointsToTest.push({ x: rx, y: ry + rh });
        pointsToTest.push({ x: rx + rw, y: ry + rh });
        pointsToTest.push({ x: rx + rw / 2, y: ry + rh / 2 });
        pointsToTest.push({ x: rx + rw / 2, y: ry });
        pointsToTest.push({ x: rx + rw / 2, y: ry + rh });
        pointsToTest.push({ x: rx, y: ry + rh / 2 });
        pointsToTest.push({ x: rx + rw, y: ry + rh / 2 });
      } else if ((s.type === 'straightLine' || s.type === 'arrow') && s.points) {
        const lx = s.x || 0;
        const ly = s.y || 0;
        pointsToTest.push({ x: lx + s.points[0], y: ly + s.points[1] });
        pointsToTest.push({ x: lx + s.points[2], y: ly + s.points[3] });
      }

      pointsToTest.forEach((p) => {
        const dist = Math.sqrt(Math.pow(p.x - currentX, 2) + Math.pow(p.y - currentY, 2));
        if (dist <= SNAP_DISTANCE && dist < minDist) {
          minDist = dist;
          closestX = p.x;
          closestY = p.y;
        }
      });
    });

    return minDist < Infinity ? { x: closestX, y: closestY } : null;
  };

  const updateEndpoint = (e: Konva.KonvaEventObject<DragEvent>, shapeId: string, isStart: boolean, isEndEvent: boolean) => {
    e.cancelBubble = true;
    const node = e.target;
    let newX = node.x();
    let newY = node.y();

    const snap = findSnapPoint(newX, newY, shapeId);
    if (snap) {
      node.x(snap.x);
      node.y(snap.y);
      newX = snap.x;
      newY = snap.y;
    }
    
    const currentShapes = [...history[historyStep]];
    const idx = currentShapes.findIndex(s => s.id === shapeId);
    if (idx !== -1 && currentShapes[idx].points) {
      const s = currentShapes[idx];
      const newPoints = [...s.points!];
      
      const baseX = s.x || 0;
      const baseY = s.y || 0;
      
      if (isStart) {
        newPoints[0] = newX - baseX;
        newPoints[1] = newY - baseY;
      } else {
        newPoints[2] = newX - baseX;
        newPoints[3] = newY - baseY;
      }
      
      currentShapes[idx] = { ...s, points: newPoints };
      
      if (isEndEvent) {
        commitShapes(currentShapes);
      } else {
        const newHistory = [...history];
        newHistory[historyStep] = currentShapes;
        setHistory(newHistory);
      }
    }
  };

  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target === e.target.getStage()) {
      setStageX(e.target.x());
      setStageY(e.target.y());
    }
  };

  const handleShapeSelect = (e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    if (isReadOnly) return;
    if (tool === 'move') {
      setSelectedId(id);
      e.cancelBubble = true;
    }
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isReadOnly) return;
    
    containerRef.current?.focus();
    
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
    if (isReadOnly || !isDrawing.current || tool === 'move') return;

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
    if (isReadOnly) return;
    if (isDrawing.current) {
      isDrawing.current = false;
      
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
        setSelectedId(null);
      }

      if (tool === 'straightLine' || tool === 'arrow' || tool === 'rect') {
        setTool('move');
      }
    }
  };

  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
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
    <div 
      ref={containerRef}
      className={`border border-gray-200 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm relative focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${isReadOnly ? 'pointer-events-none' : ''}`} 
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {!isReadOnly && (
        <CanvasToolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          onSave={onSave ? () => onSave(shapes, stageScale, stageX, stageY) : undefined}
          onCancel={onCancel}
        />
      )}

      <div className="relative">
        <Stage
          width={700}
          height={isReadOnly ? 350 : 400}
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
          draggable={!isReadOnly && tool === 'move' && !editingTextId && !selectedId} 
          className={!isReadOnly ? (tool === 'move' ? (selectedId ? 'cursor-default' : 'cursor-grab active:cursor-grabbing') : 'cursor-crosshair') : ''}
        >
          <Layer ref={layerRef}>
            {shapes.map((shape) => {
              const isSelected = selectedId === shape.id;
              const lx = shape.x || 0;
              const ly = shape.y || 0;
              
              if (shape.type === 'straightLine' || shape.type === 'arrow') {
                return (
                  <Group key={shape.id}>
                    {shape.type === 'straightLine' ? (
                      <Line
                        id={shape.id}
                        x={lx}
                        y={ly}
                        points={shape.points}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                        hitStrokeWidth={15}
                        draggable={!isReadOnly && tool === 'move' && isSelected}
                        onDragEnd={(e) => handleDragEnd(e, shape.id)}
                        onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                      />
                    ) : (
                      <Arrow
                        id={shape.id}
                        x={lx}
                        y={ly}
                        points={shape.points!}
                        stroke={shape.stroke}
                        strokeWidth={shape.strokeWidth}
                        fill={shape.stroke}
                        pointerLength={10}
                        pointerWidth={10}
                        lineCap="round"
                        lineJoin="round"
                        hitStrokeWidth={15}
                        draggable={!isReadOnly && tool === 'move' && isSelected}
                        onDragEnd={(e) => handleDragEnd(e, shape.id)}
                        onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                      />
                    )}
                  </Group>
                );
              } else if (shape.type === 'rect') {
                return (
                  <Rect
                    id={shape.id}
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    scaleX={shape.scaleX || 1}
                    scaleY={shape.scaleY || 1}
                    width={shape.width}
                    height={shape.height}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    strokeScaleEnabled={false}
                    fillEnabled={isSelected}
                    fill={isSelected ? 'rgba(0,0,0,0)' : undefined}
                    cornerRadius={2}
                    draggable={!isReadOnly && tool === 'move' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
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
                    scaleX={shape.scaleX || 1}
                    scaleY={shape.scaleY || 1}
                    text={shape.text}
                    fontSize={shape.fontSize}
                    fill={shape.fill}
                    visible={editingTextId !== shape.id}
                    draggable={!isReadOnly && tool === 'move' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                    hitStrokeWidth={15}
                  />
                );
              }
            })}
            
            {!isReadOnly && selectedId && (() => {
               const shape = shapes.find(s => s.id === selectedId);
               if (!shape) return null;

               if (shape.type === 'rect' || shape.type === 'text') {
                 return (
                   <Transformer
                     ref={trRef}
                     rotateEnabled={false}
                     borderDash={[5, 5]}
                     borderStroke="#3b82f6"
                     borderStrokeWidth={1.5}
                     padding={8}
                     boundBoxFunc={(oldBox, newBox) => {
                       if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                         return oldBox;
                       }
                       return newBox;
                     }}
                   />
                 );
               }

               if ((shape.type === 'straightLine' || shape.type === 'arrow') && shape.points && tool === 'move') {
                 const lx = shape.x || 0;
                 const ly = shape.y || 0;
                 return (
                   <>
                     <Circle
                       name="lineEdgeHandle"
                       x={lx + shape.points[0]}
                       y={ly + shape.points[1]}
                       radius={6}
                       fill="white"
                       stroke="#3b82f6"
                       strokeWidth={2}
                       draggable
                       onDragStart={(e) => { e.cancelBubble = true; }}
                       onDragMove={(e) => updateEndpoint(e, shape.id, true, false)}
                       onDragEnd={(e) => updateEndpoint(e, shape.id, true, true)}
                       onMouseDown={(e) => { e.cancelBubble = true; }}
                     />
                     <Circle
                       name="lineEdgeHandle"
                       x={lx + shape.points[2]}
                       y={ly + shape.points[3]}
                       radius={6}
                       fill="white"
                       stroke="#3b82f6"
                       strokeWidth={2}
                       draggable
                       onDragStart={(e) => { e.cancelBubble = true; }}
                       onDragMove={(e) => updateEndpoint(e, shape.id, false, false)}
                       onDragEnd={(e) => updateEndpoint(e, shape.id, false, true)}
                       onMouseDown={(e) => { e.cancelBubble = true; }}
                     />
                   </>
                 );
               }

               return null;
            })()}
          </Layer>
        </Stage>
        
        {!isReadOnly && editingTextId && (
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
              height: `${Math.max(1, textInputValue.split('\n').length) * 24 * stageScale + 10}px`,
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

        {!isReadOnly && (
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyStep === 0}
              className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:bg-neutral-800 dark:text-gray-300 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 transition"
              title="실행 취소 (Ctrl+Z / Cmd+Z)"
            >
              <Undo2 size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}