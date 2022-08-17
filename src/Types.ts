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
  renderingOrder: number;
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

export interface Polyline extends ElementBase {
  type: ElementType.Polyline;
  points: number[];
  fill?: string;
  stroke: string;
  strokeWidth: string;
}

export enum ElementType {
  Rect = "rect",
  Ellipse = "ellipse",
  Text = "text",
  Polyline = "polyline",
}
export type Element = Ellipse | Rect | Text | Polyline;

/*
  Alternative 1: Have everything in an array. Need to keep updating how where elements exists in the array.
  Alternative 2: Sort before rendering based on some numeric value. This will be more expensive as the whiteboard grows.
  Alternative 3: Keep a separate sorting array with the ids, this way, its at least easier to just shuffle around the ids, but we still need to update the element with sort order.

  Flow of incoming elements.
  Flow 1: New elements gets added to the top.
  Flow 2: Sometimes we bring some elements to the top.
  
  The only time something can get out of hand is if an item is removed from the sorting array, but still exists.

  Its easier to move around ids in an array, then to store all elements in an array. Since we get the O(1) lookup with the object storage.
  Re-ordering happens rarely. If we could have an object s
  
*/
export interface AppState {
  elements: {
    [id: string]: Element;
  };
  renderingOrder: string[];
  elementsCount: number;
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
      renderingOrder: 1,
    },
    "2": {
      id: "2",
      type: ElementType.Rect,
      width: 100,
      height: 100,
      x: 200,
      y: 200,
      style: {
        fill: "salmon",
        strokeWidth: 5,
        strokeDasharray: 5,
        stroke: "gray",
      },
      state: ElementState.Visible,
      rotate: 0,
      renderingOrder: 2,
    },
  },
  renderingOrder: ["1", "2"],
  elementsCount: 2,
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
