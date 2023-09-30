import { Either, isLeft, isRight, left, right } from "fp-ts/lib/Either";
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
  ClientCoordinates,
  Point,
  AppState,
} from "../../types";
import {
  copy,
  findOverlappingElement,
  getClosestCornerById,
} from "../../helpers/utility";
import { updateDiamondAction } from "../../services/Actions/Diamond";

export const getBoundingRect = (
  e: React.MouseEvent<SVGSVGElement, MouseEvent>
) => {
  const { x, y, width, height } = (
    e.target as Element
  ).parentElement?.children[0].getBoundingClientRect() || {
    x: null,
    y: null,
  };
  return {
    xOffset: x,
    yOffset: y,
    width,
    height,
  };
};

export interface SelectionAction {
  selectionCoordinates: SelectionCoordinates;
  selectionMode: SelectionMode;
}

export const setupResizeElement =
  (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    selectionCoordinates: SelectionCoordinates,
    selectionMode: SelectionMode,
    clientCoordinates: ClientCoordinates
  ) =>
  (val: Either<null, IElement>): Either<null, SelectionAction> => {
    if (isLeft(val)) {
      return left(null);
    }
    if (!(e.target instanceof Element)) return left(null);
    const { xOffset, yOffset, width, height } = getBoundingRect(e);
    if (!xOffset || !yOffset || !width || !height) return left(null);

    const element = val.right;

    const selectedCorner = getClosestCornerById(element, e.target.id);
    return right({
      selectionCoordinates: {
        ...selectionCoordinates,
        xOffset,
        yOffset,
        initialX: clientCoordinates.x,
        initialY: clientCoordinates.y,
        initialWidth: width,
        initialHeight: height,
        selectedCorner,
      },
      selectionMode: {
        ...selectionMode,
        elementType: element.type,
        type: SelectionModes.Resizing,
      },
    });
  };
export const extractElementId = (
  elementId: string,
  match: string
): Either<null, string> => {
  const vals = elementId.split(match);
  if (vals.length > 0) return right(vals[0]);
  else return left(null);
};

export const getElementFromId =
  (elements: AppState["elements"]) =>
  (value: Either<null, string>): Either<null, IElement> => {
    if (isRight(value)) {
      const element = elements[value.right];
      if (element) {
        return right(element);
      }
    }
    return left(null);
  };

export const setupRotateElement =
  (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    selectionCoordinates: SelectionCoordinates,
    selectionMode: SelectionMode,
    scale: number
  ) =>
  (val: Either<null, IElement>): Either<null, SelectionAction> => {
    if (isLeft(val)) {
      return left(null);
    }
    const element = val.right;
    if (!(e.target instanceof Element)) return left(null);
    const { width, height } =
      e.target.parentElement?.children[0].getBoundingClientRect() || {};
    if (!(width && height)) return left(null);
    const initialX = e.clientX * scale;
    const initialY = e.clientY * scale;
    return right({
      selectionCoordinates: {
        ...selectionCoordinates,
        initialX,
        initialY,
        initialWidth: width,
        initialHeight: height,
      },
      selectionMode: {
        ...selectionMode,
        elementType: element.type,
        type: SelectionModes.Rotating,
      },
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
    bottom: Math.max(startY, currentY),
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
      case ElementType.Diamond:
      case ElementType.Rect:
      case ElementType.Text:
      case ElementType.Ellipse:
        return isRectsIntersecting(selectRect, {
          left: element.x,
          top: element.y,
          right: element.x + element.width,
          bottom: element.y + element.height,
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
    obj.x = originElement.x + diffX;
    obj.y = originElement.y + diffY;
    changeAction = updateEllipseAction(obj, true, currentUserId);
  } else if (
    obj.type === ElementType.Rect &&
    originElement.type === ElementType.Rect
  ) {
    obj.x = originElement.x + diffX;
    obj.y = originElement.y + diffY;
    changeAction = updateRectAction(obj, true, currentUserId);
  } else if (
    obj.type === ElementType.Diamond &&
    originElement.type === ElementType.Diamond
  ) {
    obj.x = originElement.x + diffX;
    obj.y = originElement.y + diffY;
    changeAction = updateDiamondAction(obj, true, currentUserId);
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
  x: number,
  y: number,
  elements: IElement[]
) => {
  const overlappingElement = findOverlappingElement(x, y, elements);
  if (overlappingElement) {
    switch (overlappingElement.type) {
      case ElementType.Rect:
      case ElementType.Text:
      case ElementType.Diamond:
      case ElementType.Ellipse:
        return {
          x,
          y,
          connectingElementId: overlappingElement.id,
          connectingPointX: overlappingElement.x - x,
          connectingPointY: overlappingElement.y - y,
        };
      default:
        break;
    }
  }
  return {
    x,
    y,
    connectingElementId: undefined,
    connectingPointX: undefined,
    connectingPointY: undefined,
  };
};

export const getClientCoordinates = (
  e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  viewBox: ViewBox
): ClientCoordinates => {
  const { clientX, clientY } = e;
  return {
    x: clientX * viewBox.scale + viewBox.x,
    y: clientY * viewBox.scale + viewBox.y,
  };
};

export const getClosestElementId = (
  e: React.MouseEvent<SVGSVGElement, MouseEvent>
) => {
  if (!(e.target instanceof Element)) return;

  let id = e.target.id;
  const parentElementId = e.target.parentElement?.id;
  if (!id && parentElementId) {
    id = parentElementId;
  }
  if (!id) {
    console.error("Could not find element id");
  }
  return id;
};

export const getViewBoxAfterZoom = (
  viewBox: ViewBox,
  offsetX: number,
  offsetY: number,
  deltaY: number,
  zoomSensitivity: number = 0.05
) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const mx = offsetX;
  const my = offsetY;
  const dw = w * Math.sign(deltaY) * zoomSensitivity;
  const dh = h * Math.sign(deltaY) * zoomSensitivity;
  const dx = (dw * mx) / w;
  const dy = (dh * my) / h;
  const newViewBox = {
    x: viewBox.x - dx,
    y: viewBox.y - dy,
    w: viewBox.w + dw,
    h: viewBox.h + dh,
    scale: (viewBox.w + dw) / w,
  };
  return newViewBox;
};

export const isPointSame = (p1: Point, p2: Point) => {
  if (p1.x === p2.x && p1.y === p2.y) {
    return true;
  } else if (
    Boolean(p1.connectingElementId) ||
    Boolean(p2.connectingElementId)
  ) {
    return (
      p1.connectingElementId === p2.connectingElementId &&
      p1.connectingPointX === p2.connectingPointX &&
      p1.connectingPointY === p2.connectingPointY
    );
  }
  return false;
};
