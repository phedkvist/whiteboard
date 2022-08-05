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
  Rotating = "Rotating",
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
  rotate: number;
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

export interface AppState {
  elements: {
    [id: string]: Element;
  };
}

export const initialState: AppState = {
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
      rotate: 0,
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
      rotate: 0,
    },
    "3": {
      id: "3",
      type: ElementType.Rect,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      style: { fill: "blue" },
      state: ElementState.Visible,
      rotate: 0,
    },
  },
};

export const initialSelectionCoordinates = {
  currentX: null,
  currentY: null,
  initialX: null,
  initialY: null,
  initialHeight: null,
  initialWidth: null,
  xOffset: 0,
  yOffset: 0,
  selectedCorner: null,
};
