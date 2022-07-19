import { CSSProperties } from "react";

export interface SelectionCoordinates {
  currentX: null | number;
  currentY: null | number;
  initialX: null | number;
  initialY: null | number;
  xOffset: number;
  yOffset: number;
}

export enum SelectionModes {
  None,
  Add,
  Edit,
  Selection,
}

export interface SelectionMode {
  type: SelectionModes;
  elementType?: ElementType;
}

export enum ElementState {
  Visible,
  Hidden,
  Creation,
}

export interface Circle {
  id: string;
  type: ElementType.Circle;
  style?: CSSProperties;
  cx: number;
  cy: number;
  r: number;
  state: ElementState;
}

export interface Rect {
  id: string;
  type: ElementType.Rect;
  width: number;
  height: number;
  style?: CSSProperties;
  rx?: number;
  ry?: number;
  x: number;
  y: number;
  state: ElementState;
}

export enum ElementType {
  Rect = "rect",
  Circle = "circle",
}
export type Element = Circle | Rect;

export interface CanvasState {
  elements: {
    [id: string]: Element;
  };
}

export const initialState: CanvasState = {
  elements: {
    "1": {
      id: "1",
      type: ElementType.Circle,
      cx: 50,
      cy: 50,
      r: 50,
      style: { fill: "red" },
      state: ElementState.Visible,
    },
    "2": {
      id: "2",
      type: ElementType.Rect,
      width: 100,
      height: 100,
      x: 200,
      y: 200,
      style: { fill: "blue" },
      state: ElementState.Visible,
    },
  },
};
