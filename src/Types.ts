import { CSSProperties } from "react";

export interface SelectionCoordinates {
  currentX: null | number;
  currentY: null | number;
  initialX: null | number;
  initialY: null | number;
  initialWidth: null | number;
  initialHeight: null | number;
  xOffset: number;
  yOffset: number;
  selectedCorner: null | Corner;
}

export enum Corner {
  TopLeft = "TopLeft",
  TopRight = "TopRight",
  BottomLeft = "BottomLeft",
  BottomRight = "BottomRight",
}

export enum SelectionModes {
  None = "None",
  Add = "Add",
  Selected = "Selected",
  Resizing = "Resizing",
  Turning = "Turning",
}

export interface SelectionMode {
  type: SelectionModes;
  elementType?: ElementType;
}

export enum ElementState {
  Visible = "visible",
  Hidden = "hidden",
  Creation = "creation",
}

interface ElementBase {
  id: string;
  style?: CSSProperties;
  state: ElementState;
}

// TODO: Turn these into classes that can also contain rendering functions.
export interface Ellipse extends ElementBase {
  type: ElementType.Ellipse;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface Rect extends ElementBase {
  type: ElementType.Rect;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
  x: number;
  y: number;
}

export interface Text extends ElementBase {
  type: ElementType.Text;
  text: string;
  x: number;
  y: number;
}

export enum ElementType {
  Rect = "rect",
  Ellipse = "ellipse",
  Text = "text",
}
export type Element = Ellipse | Rect | Text;

export interface CanvasState {
  elements: {
    [id: string]: Element;
  };
}

export const initialState: CanvasState = {
  elements: {
    "1": {
      id: "1",
      type: ElementType.Ellipse,
      cx: 50,
      cy: 50,
      rx: 50,
      ry: 50,
      style: {
        fill: "red",
        strokeWidth: 5,
        strokeDasharray: 5,
        stroke: "#f8a100",
      },
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
