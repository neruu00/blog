import { Rect, Line, Arrow, Text, Ellipse, Group } from 'react-konva';
import Konva from 'konva';
import { Shape } from './types';

export interface BaseShapeProps {
  shape: Shape;
  isSelected: boolean;
  isReadOnly: boolean;
  tool: string;
  strokeColor: string;
  shadowProps: any;
  lx: number;
  ly: number;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>, id: string) => void;
  onTransformStart: () => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>, id: string) => void;
  onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>, id: string) => void;
  onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const RectShape = ({ shape, isSelected, isReadOnly, tool, strokeColor, shadowProps, onDragEnd, onTransformStart, onTransformEnd, onMouseDown, onMouseEnter, onMouseLeave }: BaseShapeProps) => (
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
    onDragEnd={(e) => onDragEnd(e, shape.id)}
    onTransformStart={onTransformStart}
    onTransformEnd={(e) => onTransformEnd(e, shape.id)}
    onMouseDown={(e) => onMouseDown(e, shape.id)}
    onMouseEnter={(e) => onMouseEnter(e, shape.id)}
    onMouseLeave={onMouseLeave}
    hitStrokeWidth={15}
    {...shadowProps}
  />
);

export const EllipseShape = ({ shape, isSelected, isReadOnly, tool, strokeColor, shadowProps, onDragEnd, onTransformStart, onTransformEnd, onMouseDown, onMouseEnter, onMouseLeave }: BaseShapeProps) => (
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
    onDragEnd={(e) => onDragEnd(e, shape.id)}
    onTransformStart={onTransformStart}
    onTransformEnd={(e) => onTransformEnd(e, shape.id)}
    onMouseDown={(e) => onMouseDown(e, shape.id)}
    onMouseEnter={(e) => onMouseEnter(e, shape.id)}
    onMouseLeave={onMouseLeave}
    hitStrokeWidth={15}
    {...shadowProps}
  />
);

export interface LineOrArrowShapeProps extends BaseShapeProps {
  shapes: Shape[];
}

export const LineOrArrowShape = ({ shape, isSelected, isReadOnly, tool, strokeColor, shadowProps, lx, ly, shapes, onDragEnd, onMouseDown, onMouseEnter, onMouseLeave }: LineOrArrowShapeProps) => {
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

  const commonLineProps = {
    stroke: strokeColor,
    strokeWidth: shape.strokeWidth,
    lineCap: "round" as const,
    lineJoin: "round" as const,
    hitStrokeWidth: 15,
    draggable: !isReadOnly && tool === 'select' && isSelected,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => onDragEnd(e, shape.id),
    onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseDown(e, shape.id),
    onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => onMouseEnter(e, shape.id),
    onMouseLeave: onMouseLeave,
    ...shadowProps
  };

  return (
    <Group>
      {shape.type === 'straightLine' ? (
        <>
          <Line
            id={shape.id}
            x={lx}
            y={ly}
            points={renderAsTwoParts ? part1 : shape.points}
            {...commonLineProps}
          />
          {renderAsTwoParts && (
            <Line
              x={lx}
              y={ly}
              points={part2}
              {...commonLineProps}
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
              {...commonLineProps}
            />
          )}
          <Arrow
            id={shape.id}
            x={lx}
            y={ly}
            points={renderAsTwoParts ? part2 : shape.points!}
            fill={strokeColor}
            pointerLength={10}
            pointerWidth={10}
            {...commonLineProps}
          />
        </>
      )}
    </Group>
  );
};

export interface TextShapeProps extends BaseShapeProps {
  editingTextId: string | null;
  shapes: Shape[];
  snappedShapeId: string | null;
  setSnappedShapeId: (id: string | null) => void;
  onDragEndComplete: (e: Konva.KonvaEventObject<DragEvent>, shapeId: string, snappedToId: string | null) => void;
}

export const TextShape = ({ shape, isSelected, isReadOnly, tool, shadowProps, editingTextId, shapes, snappedShapeId, setSnappedShapeId, onDragEndComplete, onTransformEnd, onMouseDown, onMouseEnter, onMouseLeave }: TextShapeProps) => (
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
      onDragEndComplete(e, shape.id, target); 
    }}
    onTransformEnd={(e) => onTransformEnd(e, shape.id)}
    onMouseDown={(e) => onMouseDown(e, shape.id)}
    onMouseEnter={(e) => onMouseEnter(e, shape.id)}
    onMouseLeave={onMouseLeave}
    hitStrokeWidth={15}
    {...shadowProps}
  />
);
