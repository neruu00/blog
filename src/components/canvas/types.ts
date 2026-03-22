export type ShapeType = 'straightLine' | 'arrow' | 'rect' | 'text' | 'ellipse';

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
  radiusX?: number;
  radiusY?: number;
};
