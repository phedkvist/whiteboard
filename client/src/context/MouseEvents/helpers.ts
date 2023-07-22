import { isLineInsideRect, isRectsIntersecting } from "../../helpers/intersect";
import { updateEllipseAction } from "../../services/Actions/Ellipse";
import { updatePolylineAction } from "../../services/Actions/Polyline";
import { updateRectAction } from "../../services/Actions/Rect";
import { updateTextAction } from "../../services/Actions/Text";
import {
  ViewBox,
  SelectionCoordinates,
  SelectionModes,
  SelectionMode,
  Element as IElement,
  ElementType,
} from "../../types";
import { copy, getClosestCorner } from "../../helpers/utility";

export const setupResizeElement = (
  e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  element: IElement,
  elements: { [id: string]: IElement },
  viewBox: ViewBox,
  setSelectionCoordinates: (
    value: React.SetStateAction<SelectionCoordinates>
  ) => void,
  selectionCoordinates: SelectionCoordinates,
  setSelectionMode: (value: React.SetStateAction<SelectionMode>) => void,
  selectionMode: SelectionMode
) => {
  if (!(e.target instanceof Element)) return;
  const {
    x: xOffset,
    y: yOffset,
    width,
    height,
  } = e.target?.parentElement?.children[0].getBoundingClientRect() || {
    x: null,
    y: null,
  };
  if (xOffset === null || yOffset === null) return;
  if (width === undefined || height === undefined) return;

  const initialX = e.clientX * viewBox.scale + viewBox.x;
  const initialY = e.clientY * viewBox.scale + viewBox.y;

  const selectedCorner = getClosestCorner(
    element,
    elements,
    initialX,
    initialY
  );
  if (!selectedCorner) return;
  setSelectionCoordinates({
    ...selectionCoordinates,
    xOffset,
    yOffset,
    initialX,
    initialY,
    initialWidth: width,
    initialHeight: height,
    selectedCorner,
  });
  setSelectionMode({
    ...selectionMode,
    elementType: element.type,
    type: SelectionModes.Resizing,
  });
};

export const setupRotateElement = (
  e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  element: IElement,
  setSelectionCoordinates: (
    value: React.SetStateAction<SelectionCoordinates>
  ) => void,
  selectionCoordinates: SelectionCoordinates,
  setSelectionMode: (value: React.SetStateAction<SelectionMode>) => void,
  selectionMode: SelectionMode,
  scale: number
) => {
  if (!(e.target instanceof Element)) return;
  const { width, height } =
    e.target?.parentElement?.children[0].getBoundingClientRect() || {
      x: null,
      y: null,
    };
  if (!(width && height)) return;
  const initialX = e.clientX * scale;
  const initialY = e.clientY * scale;
  setSelectionCoordinates({
    ...selectionCoordinates,
    initialX,
    initialY,
    initialWidth: width,
    initialHeight: height,
  });
  setSelectionMode({
    ...selectionMode,
    elementType: element.type,
    type: SelectionModes.Rotating,
  });
};

export const setupMovingElement = (
  e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  originElements: IElement[],
  setSelectionCoordinates: (
    value: React.SetStateAction<SelectionCoordinates>
  ) => void,
  selectionCoordinates: SelectionCoordinates,
  scale: number
) => {
  if (!(e.target instanceof Element)) return;

  // NOT SURE ABOUT THIS ONE? SHOULD BE SCALED AS WELL I BELIEVE
  const { x: xOffset, y: yOffset } = e.target.getBoundingClientRect();
  const initialX = e.clientX * scale - xOffset * scale;
  const initialY = e.clientY * scale - yOffset * scale;
  console.log({ initialX, initialY });
  setSelectionCoordinates({
    ...selectionCoordinates,
    initialX,
    initialY,
    startX: e.clientX * scale,
    startY: e.clientY * scale,
    originElements,
  });
};

export const findSelectedElements = (
  elements: {
    [id: string]: IElement;
  },
  startX: number,
  startY: number,
  currentX: number,
  currentY: number
): string[] => {
  const selectRect = {
    left: Math.min(startX, currentX),
    top: Math.min(startY, currentY),
    right: Math.max(startX, currentX),
    bottom: Math.max(startX, currentX),
  };
  return Object.keys(elements).filter((elementId) => {
    const element = elements[elementId];
    switch (element.type) {
      case ElementType.Polyline:
        return isLineInsideRect(
          element.points[0].x,
          element.points[0].y,
          element.points[1].x,
          element.points[1].y,
          selectRect
        );
      case ElementType.Rect:
      case ElementType.Text:
        return isRectsIntersecting(selectRect, {
          left: element.x,
          top: element.y,
          right: element.x + element.width,
          bottom: element.y + element.height,
        });
      case ElementType.Ellipse:
        return isRectsIntersecting(selectRect, {
          left: element.cx - element.rx,
          top: element.cy - element.ry,
          right: element.cx + element.rx,
          bottom: element.cy + element.ry,
        });
      default:
        return false;
    }
  });
};

export const setElementCoords = (
  element: IElement,
  diffX: number,
  diffY: number,
  originElement: IElement,
  currentUserId: string
) => {
  const obj = copy(element);
  let changeAction;

  if (
    obj.type === ElementType.Ellipse &&
    originElement.type === ElementType.Ellipse
  ) {
    obj.cx = diffX + originElement.cx;
    obj.cy = diffY + originElement.cy;
    changeAction = updateEllipseAction(obj, true, currentUserId);
  } else if (
    obj.type === ElementType.Rect &&
    originElement.type === ElementType.Rect
  ) {
    obj.x = originElement.x + diffX;
    obj.y = originElement.y + diffY;
    changeAction = updateRectAction(obj, true, currentUserId);
  } else if (
    obj.type === ElementType.Text &&
    originElement.type === ElementType.Text
  ) {
    obj.x = originElement.x + diffX;
    obj.y = originElement.y + diffY;
    changeAction = updateTextAction(obj, true, currentUserId);
  } else if (
    obj.type === ElementType.Polyline &&
    originElement.type === ElementType.Polyline
  ) {
    const newPoints = originElement.points.map((v) => {
      const newX = v.x + diffX;
      const newY = v.y + diffY;
      return { ...v, x: newX, y: newY };
    });
    obj.points = newPoints;
    changeAction = updatePolylineAction(obj, true, currentUserId);
  } else {
    throw new Error("Something went wrong in set element coords");
  }

  return changeAction;
};

export const getOverlappingPoint = (
  newX: number,
  newY: number,
  overlappingElement: IElement | undefined
) => {
  if (overlappingElement) {
    switch (overlappingElement.type) {
      case ElementType.Rect:
      case ElementType.Text:
        return {
          connectingElementId: overlappingElement.id,
          connectingPointX: overlappingElement.x - newX,
          connectingPointY: overlappingElement.y - newY,
        };
      case ElementType.Ellipse:
        return {
          connectingElementId: overlappingElement.id,
          connectingPointX: overlappingElement.cx - newX,
          connectingPointY: overlappingElement.cy - newY,
        };
      default:
        break;
    }
  }
  return {
    connectingElementId: undefined,
    connectingPointX: undefined,
    connectingPointY: undefined,
  };
};
