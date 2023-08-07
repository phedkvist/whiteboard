import { UserVersion } from "./services/ChangeTypes";
import { CSSProperties } from "react";

export interface SelectionCoordinates {
  currentX: null | number;
  currentY: null | number;
  initialX: null | number;
  initialY: null | number;
  startX: null | number;
  startY: null | number;
  initialWidth: null | number;
  initialHeight: null | number;
  originElements: Element[];
  xOffset: number;
  yOffset: number;
  selectedCorner: null | Corner | number;
  currentPointIndex: number;
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
  Panning = "Panning",
  TextEditing = "TextEditing",
  MultiSelecting = "MultiSelecting",
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
  text: string;
  userVersion: UserVersion;
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
  x: number;
  y: number;
}

export interface Diamond extends Omit<Rect, "type"> {
  type: ElementType.Diamond;
}

export interface Text extends ElementBase {
  type: ElementType.Text;
  width: number;
  height: number;
  x: number;
  y: number;
}

/*
  ALGO:
  just connect to a point on the element, and always stick to that point?
  but just draw the line so it stops right before the overlapping with element when rotated?
  once the element is rotated, keep rotating this point using a vector towards center, similar to
  getElementCorners, probably the easiest.

  What happens when the elements grows/shrinks?
  Adjust point with dx or dy.

  Once the point has been created, it should be easy to redraw the line as the element moves.
*/

export interface Point {
  x: number;
  y: number;
  connectingElementId?: string;
  // if point is connected to another element, then the connectingPointXY describes where on the element the point
  // is connected. This will work better in the case of concurrent edits.
  // this however wouldn't work if the element its connected to gets deleted and the element then remains.
  // could be some edge case in there? ideally it should also be removed in this case.
  // could we fall back on the original x,y then? could look into the graveyard to see x,y
  // this needs to be sorted out though :/
  // easiest is to stop rendering and element that got messed up, so the user needs to fix it again.
  connectingPointX?: number;
  connectingPointY?: number;
}

export interface Polyline extends ElementBase {
  type: ElementType.Polyline;
  points: Point[];
  fill?: string;
  stroke: string;
  strokeWidth: string;
}

export enum ElementType {
  Rect = "rect",
  Ellipse = "ellipse",
  Text = "text",
  Polyline = "polyline",
  Diamond = "diamond",
}

export type Element = Ellipse | Rect | Text | Polyline | Diamond;

// https://en.wikipedia.org/wiki/Natural_Color_System
export enum COLORS {
  transparent = "transparent",
  white = "#ffffff",
  black = "#000000",
  gray = "#D3D3D3",
  blue = "#0087BD",
  red = "#C40233",
  yellow = "#FFD300",
  green = "#009F6B",
}

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

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

export interface Cursor {
  id: string;
  username: string;
  position: {
    x: number;
    y: number;
  };
  lastUpdated: string; // ISO-timestamp
  color: string;
}
export interface AppState {
  elements: {
    [id: string]: Element;
  };
  cursors: { [id: string]: Cursor };
}

export const initialState: AppState = {
  elements: {},
  cursors: {},
};

const SCALE = 1;
export const initialViewBox = (window: Window): ViewBox => ({
  x: 0,
  y: 0,
  w: window.innerWidth * SCALE,
  h: window.innerHeight * SCALE,
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 0, y: 0 },
  scale: SCALE,
});

export const initialSelectionCoordinates = {
  currentX: null,
  currentY: null,
  initialX: null,
  initialY: null,
  startY: null,
  startX: null,
  initialHeight: null,
  initialWidth: null,
  originElements: [],
  xOffset: 0,
  yOffset: 0,
  selectedCorner: null,
  currentPointIndex: 1,
};

export interface ClientCoordinates {
  x: number;
  y: number;
}
