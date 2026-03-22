'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Arrow, Text, Transformer, Group, Circle, Ellipse } from 'react-konva';
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
  const [tool, setTool] = useState<Exclude<ShapeType, 'text'> | 'select'>('select');
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  
  const [history, setHistory] = useState<Shape[][]>([initialShapes]);
  const [historyStep, setHistoryStep] = useState(0);

  const shapes = history[historyStep];

  const isDrawing = useRef(false);

  const [stageScale, setStageScale] = useState(initialScale);
  const [stageX, setStageX] = useState(initialX);
  const [stageY, setStageY] = useState(initialY);

  const [isDraggingEndpoint, setIsDraggingEndpoint] = useState<string | null>(null);
  const [snappedShapeId, setSnappedShapeId] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const [clipboard, setClipboard] = useState<Shape | null>(null);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);
  const isSelecting = useRef(false);
  const isPanning = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });

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
      if (selectedShape && (selectedShape.type === 'rect' || selectedShape.type === 'text' || selectedShape.type === 'ellipse')) {
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
      case '1': setTool('select'); break;
      case '2': setTool('straightLine'); break;
      case '3': setTool('arrow'); break;
      case '4': setTool('rect'); break;
      case '5': setTool('ellipse'); break;
      case 'c':
      case 'C':
        if (e.ctrlKey || e.metaKey) {
          if (selectedId) {
            e.preventDefault();
            const target = shapes.find(s => s.id === selectedId);
            if (target) setClipboard(target);
          }
        }
        break;
      case 'v':
      case 'V':
        if (e.ctrlKey || e.metaKey) {
          if (clipboard) {
            e.preventDefault();
            const newId = Date.now().toString();
            const newShape = { ...clipboard, id: newId };
            if (clipboard.points) newShape.points = [...clipboard.points];
            if (newShape.x !== undefined) newShape.x += 20;
            if (newShape.y !== undefined) newShape.y += 20;
            
            commitShapes([...shapes, newShape]);
            setSelectedId(newId);
            setTool('select');
          }
        }
        break;
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

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, shapeId: string, snappedToId?: string | null) => {
    e.cancelBubble = true;
    const node = e.target;
    const currentShapes = [...history[historyStep]];
    const index = currentShapes.findIndex(s => s.id === shapeId);
    if (index !== -1) {
      const shape = currentShapes[index];
      
      let updatedShape = { ...shape };
      if (snappedToId !== undefined) {
        updatedShape.snappedToId = snappedToId;
      }
      
      if (updatedShape.type === 'straightLine' || updatedShape.type === 'arrow') {
        const nx = node.x();
        const ny = node.y();
        if (updatedShape.points && (nx !== 0 || ny !== 0)) {
          updatedShape = { 
            ...updatedShape, 
            x: 0, 
            y: 0,
            points: [
              updatedShape.points[0] + nx,
              updatedShape.points[1] + ny,
              updatedShape.points[2] + nx,
              updatedShape.points[3] + ny
            ]
          };
          node.x(0);
          node.y(0);
        }
      } else {
        updatedShape = { 
          ...updatedShape, 
          x: node.x(), 
          y: node.y() 
        };
      }
      currentShapes[index] = updatedShape;
      commitShapes(currentShapes);
    }
  };

  const handleTransform = (e: Konva.KonvaEventObject<Event>, shapeId: string) => {
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
      
      const newHistory = [...history];
      newHistory[historyStep] = currentShapes;
      setHistory(newHistory);
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

  const getAllSnapPoints = (ignoreShapeId: string) => {
    const points: { x: number; y: number; shapeId: string }[] = [];
    shapes.forEach((s) => {
      if (s.id === ignoreShapeId) return;

      if (s.type === 'rect' && s.x !== undefined && s.y !== undefined && s.width !== undefined && s.height !== undefined) {
        const rx = s.x;
        const ry = s.y;
        const rw = s.width * (s.scaleX || 1);
        const rh = s.height * (s.scaleY || 1);
        
        points.push({ x: rx, y: ry, shapeId: s.id });
        points.push({ x: rx + rw, y: ry, shapeId: s.id });
        points.push({ x: rx, y: ry + rh, shapeId: s.id });
        points.push({ x: rx + rw, y: ry + rh, shapeId: s.id });
        points.push({ x: rx + rw / 2, y: ry, shapeId: s.id });
        points.push({ x: rx + rw / 2, y: ry + rh, shapeId: s.id });
        points.push({ x: rx, y: ry + rh / 2, shapeId: s.id });
        points.push({ x: rx + rw, y: ry + rh / 2, shapeId: s.id });
      } else if ((s.type === 'straightLine' || s.type === 'arrow') && s.points) {
        const lx = s.x || 0;
        const ly = s.y || 0;
        points.push({ x: lx + s.points[0], y: ly + s.points[1], shapeId: s.id });
        points.push({ x: lx + s.points[2], y: ly + s.points[3], shapeId: s.id });
      }
    });
    return points;
  };

  const findSnapPoint = (currentX: number, currentY: number, ignoreShapeId: string) => {
    let closestX = 0;
    let closestY = 0;
    let closestShapeId: string | null = null;
    let minDist = Infinity;
    
    // Check static points
    const staticPoints = getAllSnapPoints(ignoreShapeId);
    staticPoints.forEach((p) => {
      const dist = Math.hypot(p.x - currentX, p.y - currentY);
      if (dist <= SNAP_DISTANCE && dist < minDist) {
        minDist = dist;
        closestX = p.x;
        closestY = p.y;
        closestShapeId = p.shapeId;
      }
    });

    // Check dynamic ellipse perimeter
    shapes.forEach((s) => {
      if (s.id === ignoreShapeId) return;
      if (s.type === 'ellipse' && s.x !== undefined && s.y !== undefined && s.radiusX !== undefined && s.radiusY !== undefined) {
        const cx = s.x;
        const cy = s.y;
        const rx = s.radiusX * Math.abs(s.scaleX || 1);
        const ry = s.radiusY * Math.abs(s.scaleY || 1);
        
        const angle = Math.atan2(currentY - cy, currentX - cx);
        const targetX = cx + rx * Math.cos(angle);
        const targetY = cy + ry * Math.sin(angle);
        
        const dist = Math.hypot(targetX - currentX, targetY - currentY);
        if (dist <= SNAP_DISTANCE && dist < minDist) {
          minDist = dist;
          closestX = targetX;
          closestY = targetY;
          closestShapeId = s.id;
        }
      }
    });

    return minDist < Infinity && closestShapeId ? { x: closestX, y: closestY, shapeId: closestShapeId } : null;
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
      setSnappedShapeId(snap.shapeId);
    } else {
      setSnappedShapeId(null);
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

    if (isEndEvent) {
      setIsDraggingEndpoint(null);
      setSnappedShapeId(null);
    } else {
      setIsDraggingEndpoint(shapeId);
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
    if (e.evt.button === 2 || e.evt.button === 1) return;
    if (tool === 'select') {
      setSelectedId(id);
      setHoveredShapeId(null);
      const stage = e.target.getStage();
      if (stage) stage.container().style.cursor = '';
      e.cancelBubble = true;
      
      const shape = shapes.find(s => s.id === id);
      if (shape) {
        if (shape.type === 'text') {
          if (shape.fill) setColor(shape.fill);
          if (shape.fontSize) setFontSize(shape.fontSize);
        } else if (shape.stroke) {
          setColor(shape.stroke);
        }
      }
    }
  };

  const handleMouseEnter = useCallback((e: Konva.KonvaEventObject<MouseEvent>, id: string) => {
    if (isReadOnly || selectedId || tool !== 'select') return;
    setHoveredShapeId(id);
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = 'pointer';
  }, [isReadOnly, selectedId, tool]);

  const handleMouseLeave = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    setHoveredShapeId(null);
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = '';
  }, []);

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isReadOnly) return;

    if (e.evt.button === 2 || e.evt.button === 1) {
      e.evt.preventDefault();
      isPanning.current = true;
      lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }
    
    containerRef.current?.focus();
    
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      setSelectedId(null);
      if (tool === 'select') {
        const stage = e.target.getStage();
        if (stage) {
          const pos = getRelativePointerPosition(stage);
          if (pos) {
            isSelecting.current = true;
            setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
          }
        }
      }
    }

    if (editingTextId) {
      setEditingTextId(null);
      return;
    }
    
    if (tool === 'select') return;
        
    isDrawing.current = true;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const id = Date.now().toString();

    let newShape: Shape;
    if (tool === 'straightLine' || tool === 'arrow') {
      let startX = pos.x;
      let startY = pos.y;
      const snap = findSnapPoint(pos.x, pos.y, id);
      if (snap) {
        startX = snap.x;
        startY = snap.y;
        setSnappedShapeId(snap.shapeId);
      } else {
        setSnappedShapeId(null);
      }
      newShape = { id, type: tool, x: 0, y: 0, points: [startX, startY, startX, startY], stroke: color, strokeWidth: 4 };
    } else if (tool === 'rect') {
      newShape = { id, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, stroke: color, strokeWidth: 2 };
    } else if (tool === 'ellipse') {
      newShape = { id, type: 'ellipse', x: pos.x, y: pos.y, radiusX: 0, radiusY: 0, stroke: color, strokeWidth: 2 };
    } else {
      return;
    }
    
    setSelectedId(id);
    commitShapes([...shapes, newShape]);
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isReadOnly) return;

    if (isPanning.current) {
      const dx = e.evt.clientX - lastPanPos.current.x;
      const dy = e.evt.clientY - lastPanPos.current.y;
      setStageX(prev => prev + dx);
      setStageY(prev => prev + dy);
      lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }

    if (isSelecting.current && tool === 'select' && selectionRect) {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = getRelativePointerPosition(stage);
      if (pos) {
        setSelectionRect({
          ...selectionRect,
          width: pos.x - selectionRect.x,
          height: pos.y - selectionRect.y
        });
      }
      return;
    }

    if (!isDrawing.current || tool === 'select') return;

    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const currentShapes = [...history[historyStep]];
    let lastShape = { ...currentShapes[currentShapes.length - 1] };

    if ((tool === 'straightLine' || tool === 'arrow') && lastShape.points) {
      const snap = findSnapPoint(pos.x, pos.y, lastShape.id);
      if (snap) {
        lastShape.points = [lastShape.points[0], lastShape.points[1], snap.x, snap.y];
        setSnappedShapeId(snap.shapeId);
      } else {
        lastShape.points = [lastShape.points[0], lastShape.points[1], pos.x, pos.y];
        setSnappedShapeId(null);
      }
    } else if (tool === 'rect' && lastShape.type === 'rect') {
      lastShape.width = pos.x - (lastShape.x || 0);
      lastShape.height = pos.y - (lastShape.y || 0);
    } else if (tool === 'ellipse' && lastShape.type === 'ellipse') {
      lastShape.radiusX = Math.abs(pos.x - (lastShape.x || 0));
      lastShape.radiusY = Math.abs(pos.y - (lastShape.y || 0));
    }

    currentShapes[currentShapes.length - 1] = lastShape;
    const newHistory = [...history];
    newHistory[historyStep] = currentShapes;
    setHistory(newHistory);
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isReadOnly) return;

    if (isPanning.current) {
      isPanning.current = false;
      return;
    }

    if (isSelecting.current) {
      isSelecting.current = false;
      if (selectionRect && layerRef.current) {
        const absBox = {
          x: selectionRect.x * stageScale + stageX,
          y: selectionRect.y * stageScale + stageY,
          width: selectionRect.width * stageScale,
          height: selectionRect.height * stageScale
        };
        const selRect = {
          x: Math.min(absBox.x, absBox.x + absBox.width),
          y: Math.min(absBox.y, absBox.y + absBox.height),
          width: Math.abs(absBox.width),
          height: Math.abs(absBox.height)
        };
        
        if (selRect.width > 5 && selRect.height > 5) {
          let foundShape = null;
          for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];
            const node = layerRef.current.findOne('#' + shape.id);
            if (node) {
              const clientRect = node.getClientRect();
              if (Konva.Util.haveIntersection(selRect, clientRect)) {
                foundShape = shape;
                break;
              }
            }
          }
          if (foundShape) {
             setSelectedId(foundShape.id);
             if (foundShape.type === 'text') {
               if (foundShape.fill) setColor(foundShape.fill);
               if (foundShape.fontSize) setFontSize(foundShape.fontSize);
             } else if (foundShape.stroke) {
               setColor(foundShape.stroke);
             }
          }
        }
      }
      setSelectionRect(null);
    }

    if (isDrawing.current) {
      isDrawing.current = false;
      setSnappedShapeId(null);
      
      const currentShapes = [...history[historyStep]];
      const lastShape = currentShapes[currentShapes.length - 1];
      let isEmpty = false;
      if (lastShape) {
        if (lastShape.type === 'rect' && lastShape.width === 0 && lastShape.height === 0) {
          isEmpty = true;
        } else if (lastShape.type === 'ellipse' && lastShape.radiusX === 0 && lastShape.radiusY === 0) {
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

      if (tool === 'straightLine' || tool === 'arrow' || tool === 'rect' || tool === 'ellipse') {
        setTool('select');
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
        setTool('select');
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
      fontSize: fontSize,
    };

    setTool('select');
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

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    
    if (selectedId) {
      const currentShapes = [...history[historyStep]];
      const index = currentShapes.findIndex(s => s.id === selectedId);
      if (index !== -1) {
        if (currentShapes[index].type === 'text') {
          currentShapes[index] = { ...currentShapes[index], fill: newColor };
        } else {
          currentShapes[index] = { ...currentShapes[index], stroke: newColor };
        }
        commitShapes(currentShapes);
      }
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (selectedId) {
      const currentShapes = [...history[historyStep]];
      const index = currentShapes.findIndex(s => s.id === selectedId);
      if (index !== -1 && currentShapes[index].type === 'text') {
        currentShapes[index] = { ...currentShapes[index], fontSize: size };
        commitShapes(currentShapes);
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

  const selectedShapeInfo = shapes.find(s => s.id === selectedId);

  return (
    <div 
      ref={containerRef}
      className={`border border-gray-200 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm relative focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${isReadOnly ? 'pointer-events-none' : ''}`} 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!isReadOnly && (
        <CanvasToolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={handleColorChange}
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
          onContextMenu={(e) => e.evt.preventDefault()}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stageX}
          y={stageY}
          draggable={false} 
          className={!isReadOnly ? (isPanning.current ? 'cursor-grabbing' : tool === 'select' ? 'cursor-default' : 'cursor-crosshair') : ''}
        >
          <Layer ref={layerRef}>
            {shapes.map((shape) => {
              const isSelected = selectedId === shape.id;
              const isHovered = hoveredShapeId === shape.id && !selectedId && tool === 'select';
              const lx = shape.x || 0;
              const ly = shape.y || 0;
              
              const isSnappedTarget = snappedShapeId === shape.id;
              const strokeColor = isSnappedTarget ? '#22c55e' : shape.stroke;

              const shadowProps = isHovered ? { shadowColor: '#3b82f6', shadowBlur: 10, shadowOpacity: 0.8, shadowOffset: { x: 0, y: 0 } } : {};
              
              if (shape.type === 'straightLine' || shape.type === 'arrow') {
                let renderAsTwoParts = false;
                let part1: number[] = [];
                let part2: number[] = [];
                
                const cuttingText = shapes.find(s => s.type === 'text' && s.snappedToId === shape.id);
                if (cuttingText && shape.points) {
                   const p0x = shape.points[0];
                   const p0y = shape.points[1];
                   const p1x = shape.points[2];
                   const p1y = shape.points[3];
                   const dx = p1x - p0x;
                   const dy = p1y - p0y;
                   const len = Math.hypot(dx, dy);
                   const gap = 30 + (cuttingText.text?.length || 5) * 8;
                   
                   if (len > gap * 1.5) {
                      const ratio = (gap / 2) / len;
                      part1 = [p0x, p0y, p0x + dx*(0.5-ratio), p0y + dy*(0.5-ratio)];
                      part2 = [p0x + dx*(0.5+ratio), p0y + dy*(0.5+ratio), p1x, p1y];
                      renderAsTwoParts = true;
                   }
                }

                return (
                  <Group key={shape.id}>
                    {shape.type === 'straightLine' ? (
                      <>
                        <Line
                          id={shape.id}
                          x={lx}
                          y={ly}
                          points={renderAsTwoParts ? part1 : shape.points}
                          stroke={strokeColor}
                          strokeWidth={shape.strokeWidth}
                          lineCap="round"
                          lineJoin="round"
                          hitStrokeWidth={15}
                          draggable={!isReadOnly && tool === 'select' && isSelected}
                          onDragEnd={(e) => handleDragEnd(e, shape.id)}
                          onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                          onMouseEnter={(e) => handleMouseEnter(e, shape.id)}
                          onMouseLeave={handleMouseLeave}
                          {...shadowProps}
                        />
                        {renderAsTwoParts && (
                          <Line
                            x={lx}
                            y={ly}
                            points={part2}
                            stroke={strokeColor}
                            strokeWidth={shape.strokeWidth}
                            lineCap="round"
                            lineJoin="round"
                            hitStrokeWidth={15}
                            draggable={!isReadOnly && tool === 'select' && isSelected}
                            onDragEnd={(e) => handleDragEnd(e, shape.id)}
                            onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                            onMouseEnter={(e) => handleMouseEnter(e, shape.id)}
                            onMouseLeave={handleMouseLeave}
                            {...shadowProps}
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {renderAsTwoParts && (
                          <Line
                            x={lx}
                            y={ly}
                            points={part1}
                            stroke={strokeColor}
                            strokeWidth={shape.strokeWidth}
                            lineCap="round"
                            lineJoin="round"
                            hitStrokeWidth={15}
                            draggable={!isReadOnly && tool === 'select' && isSelected}
                            onDragEnd={(e) => handleDragEnd(e, shape.id)}
                            onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                            onMouseEnter={(e) => handleMouseEnter(e, shape.id)}
                            onMouseLeave={handleMouseLeave}
                            {...shadowProps}
                          />
                        )}
                        <Arrow
                          id={shape.id}
                          x={lx}
                          y={ly}
                          points={renderAsTwoParts ? part2 : shape.points!}
                          stroke={strokeColor}
                          strokeWidth={shape.strokeWidth}
                          fill={strokeColor}
                          pointerLength={10}
                          pointerWidth={10}
                          lineCap="round"
                          lineJoin="round"
                          hitStrokeWidth={15}
                          draggable={!isReadOnly && tool === 'select' && isSelected}
                          onDragEnd={(e) => handleDragEnd(e, shape.id)}
                          onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                          onMouseEnter={(e) => handleMouseEnter(e, shape.id)}
                          onMouseLeave={handleMouseLeave}
                          {...shadowProps}
                        />
                      </>
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
                    stroke={strokeColor}
                    strokeWidth={shape.strokeWidth}
                    strokeScaleEnabled={false}
                    fillEnabled={isSelected}
                    fill={isSelected ? 'rgba(0,0,0,0)' : undefined}
                    cornerRadius={2}
                    draggable={!isReadOnly && tool === 'select' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onTransformStart={() => setIsTransforming(true)}
                    onTransform={(e) => handleTransform(e, shape.id)}
                    onTransformEnd={(e) => { setIsTransforming(false); handleTransformEnd(e, shape.id); }}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                    onMouseEnter={(e) => handleMouseEnter(e, shape.id)}
                    onMouseLeave={handleMouseLeave}
                    hitStrokeWidth={15}
                    {...shadowProps}
                  />
                );
              } else if (shape.type === 'ellipse') {
                return (
                  <Ellipse
                    id={shape.id}
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    radiusX={shape.radiusX || 0}
                    radiusY={shape.radiusY || 0}
                    scaleX={shape.scaleX || 1}
                    scaleY={shape.scaleY || 1}
                    stroke={strokeColor}
                    strokeWidth={shape.strokeWidth}
                    strokeScaleEnabled={false}
                    fillEnabled={isSelected}
                    fill={isSelected ? 'rgba(0,0,0,0)' : undefined}
                    draggable={!isReadOnly && tool === 'select' && isSelected}
                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                    onTransformStart={() => setIsTransforming(true)}
                    onTransform={(e) => handleTransform(e, shape.id)}
                    onTransformEnd={(e) => { setIsTransforming(false); handleTransformEnd(e, shape.id); }}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                    onMouseEnter={(e) => handleMouseEnter(e, shape.id)}
                    onMouseLeave={handleMouseLeave}
                    hitStrokeWidth={15}
                    {...shadowProps}
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
                    draggable={!isReadOnly && tool === 'select' && isSelected}
                    onDragMove={(e) => {
                      const node = e.target;
                      let cx = node.x() + (node.width() * node.scaleX()) / 2;
                      let cy = node.y() + (node.height() * node.scaleY()) / 2;
                      let snapTargetId = null;
                      
                      for (const s of shapes) {
                        if (s.id === shape.id) continue;
                        if (s.type === 'rect' && s.x !== undefined && s.y !== undefined && s.width !== undefined && s.height !== undefined) {
                           const targetCx = s.x + (s.width * (s.scaleX||1)) / 2;
                           const targetCy = s.y + (s.height * (s.scaleY||1)) / 2;
                           if (Math.hypot(cx - targetCx, cy - targetCy) < 20) {
                              cx = targetCx;
                              cy = targetCy;
                              snapTargetId = s.id;
                              break;
                           }
                        } else if (s.type === 'ellipse' && s.x !== undefined && s.y !== undefined) {
                           const targetCx = s.x;
                           const targetCy = s.y;
                           if (Math.hypot(cx - targetCx, cy - targetCy) < 20) {
                              cx = targetCx;
                              cy = targetCy;
                              snapTargetId = s.id;
                              break;
                           }
                        } else if ((s.type === 'straightLine' || s.type === 'arrow') && s.points) {
                           const lx = s.x || 0;
                           const ly = s.y || 0;
                           const midX = lx + (s.points[0] + s.points[2]) / 2;
                           const midY = ly + (s.points[1] + s.points[3]) / 2;
                           if (Math.hypot(cx - midX, cy - midY) < 20) {
                              cx = midX;
                              cy = midY;
                              snapTargetId = s.id;
                              break;
                           }
                        }
                      }
                      
                      if (snapTargetId) {
                         node.x(cx - (node.width() * node.scaleX()) / 2);
                         node.y(cy - (node.height() * node.scaleY()) / 2);
                         setSnappedShapeId(snapTargetId);
                      } else {
                         setSnappedShapeId(null);
                      }
                    }}
                    onDragEnd={(e) => { 
                      const target = snappedShapeId;
                      setSnappedShapeId(null); 
                      handleDragEnd(e, shape.id, target); 
                    }}
                    onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                    onMouseDown={(e) => handleShapeSelect(e, shape.id)}
                    onMouseEnter={(e) => handleMouseEnter(e, shape.id)}
                    onMouseLeave={handleMouseLeave}
                    hitStrokeWidth={15}
                    {...shadowProps}
                  />
                );
              }
            })}

            {selectionRect && (
              <Rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth={1}
                listening={false}
              />
            )}

            {(isDraggingEndpoint || (isDrawing.current && (tool === 'straightLine' || tool === 'arrow'))) && 
              getAllSnapPoints(isDraggingEndpoint || selectedId || '').map((p, i) => (
              <Circle
                key={`snap-${i}`}
                x={p.x}
                y={p.y}
                radius={4 / stageScale}
                fill="rgba(59, 130, 246, 0.4)"
                stroke="rgba(59, 130, 246, 0.8)"
                strokeWidth={1 / stageScale}
                listening={false}
              />
            ))}
            
            {!isReadOnly && selectedId && (() => {
               const shape = shapes.find(s => s.id === selectedId);
               if (!shape) return null;

               if (shape.type === 'rect' || shape.type === 'text' || shape.type === 'ellipse') {
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

               if ((shape.type === 'straightLine' || shape.type === 'arrow') && shape.points && tool === 'select') {
                 const lx = shape.x || 0;
                 const ly = shape.y || 0;
                 return (
                   <>
                     <Circle
                       name="lineEdgeHandle"
                       x={lx + shape.points[0]}
                       y={ly + shape.points[1]}
                       radius={6 / stageScale}
                       fill="white"
                       stroke="#3b82f6"
                       strokeWidth={2 / stageScale}
                       hitStrokeWidth={15 / stageScale}
                       draggable
                       onDragStart={(e) => { e.cancelBubble = true; setIsDraggingEndpoint(shape.id); }}
                       onDragMove={(e) => updateEndpoint(e, shape.id, true, false)}
                       onDragEnd={(e) => updateEndpoint(e, shape.id, true, true)}
                       onMouseDown={(e) => { e.cancelBubble = true; }}
                     />
                     <Circle
                       name="lineEdgeHandle"
                       x={lx + shape.points[2]}
                       y={ly + shape.points[3]}
                       radius={6 / stageScale}
                       fill="white"
                       stroke="#3b82f6"
                       strokeWidth={2 / stageScale}
                       hitStrokeWidth={15 / stageScale}
                       draggable
                       onDragStart={(e) => { e.cancelBubble = true; setIsDraggingEndpoint(shape.id); }}
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
        
        {!isReadOnly && !editingTextId && selectedShapeInfo?.type === 'text' && (
          <div 
            className="absolute flex items-center gap-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 shadow-lg rounded-lg p-1 z-10 animate-in fade-in slide-in-from-bottom-2"
            style={{
               left: (selectedShapeInfo.x || 0) * stageScale + stageX,
               top: (selectedShapeInfo.y || 0) * stageScale + stageY - 45, 
            }}
          >
            <button
               type="button"
               onClick={() => handleFontSizeChange(48)}
               className={`px-2.5 py-1 rounded text-sm font-bold transition-colors ${fontSize === 48 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700'}`}
            >T1</button>
            <button
               type="button"
               onClick={() => handleFontSizeChange(32)}
               className={`px-2.5 py-1 rounded text-sm font-semibold transition-colors ${fontSize === 32 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700'}`}
            >T2</button>
            <button
               type="button"
               onClick={() => handleFontSizeChange(24)}
               className={`px-2.5 py-1 rounded text-sm transition-colors ${fontSize === 24 ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700'}`}
            >T3</button>
          </div>
        )}

        {!isReadOnly && editingTextId && (
          <textarea
            autoFocus
            value={textInputValue}
            onChange={handleTextChange}
            className="absolute bg-transparent border border-blue-500 border-dashed outline-none resize-none overflow-hidden text-black dark:text-white"
            style={{
              top: textInputPos.y,
              left: textInputPos.x,
              fontSize: `${fontSize * stageScale}px`,
              fontFamily: 'sans-serif',
              minWidth: `${100 * stageScale}px`,
              height: `${Math.max(1, textInputValue.split('\n').length) * (fontSize * 1.2) * stageScale + 10}px`,
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
              setTool('select');
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