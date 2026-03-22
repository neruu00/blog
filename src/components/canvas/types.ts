export type ShapeType = 'rect' | 'straightLine' | 'arrow' | 'text';

export type Shape = {
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
  scaleX?: number;
  scaleY?: number;
};
