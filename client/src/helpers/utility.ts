import { CONNECTING_BORDER_SIZE } from "../constants";
import { UserVersion } from "../services/ChangeTypes";
import {
  Corner,
  Diamond,
  Element,
  ElementType,
  Ellipse,
  Rect,
  Text,
} from "../types";
import { isPointInsideEllipse, isPointInsideRect } from "./intersect";

export enum MouseButtons {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
}

export const getClosestCornerById = (
  element: Element,
  id: string
): Corner | number | null => {
  switch (element.type) {
    case ElementType.Polyline: {
      const parts = id.split("-");
      const pointIndex = parts[parts.length - 1];
      return Number(pointIndex);
    }
    case ElementType.Text:
    case ElementType.Ellipse:
    case ElementType.Diamond:
    case ElementType.Rect: {
      const parts = id.split("-");
      const horizontal = parts[parts.length - 2];
      const vertical = parts[parts.length - 1];
      return (horizontal[0].toUpperCase() +
        horizontal.slice(1) +
        vertical[0].toUpperCase() +
        vertical.slice(1)) as Corner;
    }
    default: {
      console.error("Could not find corner");
      return null;
    }
  }
};

export function rotateCenter(
  x: number,
  y: number,
  cx: number,
  cy: number,
  angle: number
) {
  return [
    (x - cx) * Math.cos(angle * (Math.PI / 180)) -
      (y - cy) * Math.sin(angle * (Math.PI / 180)) +
      cx,
    (x - cx) * Math.sin(angle * (Math.PI / 180)) +
      (y - cy) * Math.cos(angle * (Math.PI / 180)) +
      cy,
  ];
}

export const resizeRect = (
  selectedCorner: Corner,
  clientX: number,
  clientY: number,
  rect: Rect | Text | Diamond | Ellipse
) => {
  const { x, y, width: w, height: h, rotate } = rect;

  const cx = x + w / 2;
  const cy = y + h / 2;
  // eslint-disable-next-line
  const [newWidth, newHeight, newX, newY, _newCX, _newCY] =
    resizeRotatedRectangle({
      x,
      y,
      cx,
      cy,
      w,
      h,
      rotate,
      selectedCorner,
      clientX,
      clientY,
    });
  return [newWidth, newHeight, newX, newY];
};

const resizeRotatedRectangle = ({
  x,
  y,
  cx,
  cy,
  w,
  h,
  rotate,
  selectedCorner,
  clientX,
  clientY,
}: {
  x: number;
  y: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotate: number;
  selectedCorner: Corner;
  clientX: number;
  clientY: number;
}) => {
  // https://shihn.ca/posts/2020/resizing-rotated-elements/

  /*
  A = top left corner
  B = top right corner
  C = bottom right corner
  D = bottom left corner
  */
  const rotatedA = rotateCenter(x, y, cx, cy, rotate);
  const rotatedB = rotateCenter(x + w, y, cx, cy, rotate);
  const rotatedC = rotateCenter(x + w, y + h, cx, cy, rotate);
  const rotatedD = rotateCenter(x, y + h, cx, cy, rotate);

  if (selectedCorner === Corner.BottomRight) {
    const newCenter = [
      (rotatedA[0] + clientX) / 2,
      (rotatedA[1] + clientY) / 2,
    ];

    const newTopLeft = rotateCenter(
      rotatedA[0],
      rotatedA[1],
      newCenter[0],
      newCenter[1],
      -rotate
    );
    const newBottomRight = rotateCenter(
      clientX,
      clientY,
      newCenter[0],
      newCenter[1],
      -rotate
    );
    const newX = newTopLeft[0];
    const newY = newTopLeft[1];
    const newCX = newCenter[0];
    const newCY = newCenter[1];
    const newWidth = newBottomRight[0] - newTopLeft[0];
    const newHeight = newBottomRight[1] - newTopLeft[1];
    return [newWidth, newHeight, newX, newY, newCX, newCY];
  } else if (selectedCorner === Corner.BottomLeft) {
    const newCenter = [
      (rotatedB[0] + clientX) / 2,
      (rotatedB[1] + clientY) / 2,
    ];

    const newTopRight = rotateCenter(
      rotatedB[0],
      rotatedB[1],
      newCenter[0],
      newCenter[1],
      -rotate
    );
    const newBottomLeft = rotateCenter(
      clientX,
      clientY,
      newCenter[0],
      newCenter[1],
      -rotate
    );
    const newWidth = newTopRight[0] - newBottomLeft[0];
    const newHeight = newBottomLeft[1] - newTopRight[1];
    const newX = newBottomLeft[0];
    const newY = newTopRight[1];
    const newCX = newCenter[0];
    const newCY = newCenter[1];

    return [newWidth, newHeight, newX, newY, newCX, newCY];
  } else if (selectedCorner === Corner.TopRight) {
    const newCenter = [
      (rotatedD[0] + clientX) / 2,
      (rotatedD[1] + clientY) / 2,
    ];

    const newBottomLeft = rotateCenter(
      rotatedD[0],
      rotatedD[1],
      newCenter[0],
      newCenter[1],
      -rotate
    );

    const newTopRight = rotateCenter(
      clientX,
      clientY,
      newCenter[0],
      newCenter[1],
      -rotate
    );
    const newX = newBottomLeft[0];
    const newY = newTopRight[1];
    const newCX = newCenter[0];
    const newCY = newCenter[1];
    const newWidth = newTopRight[0] - newBottomLeft[0];
    const newHeight = newBottomLeft[1] - newTopRight[1];
    return [newWidth, newHeight, newX, newY, newCX, newCY];
  } else {
    // TOP LEFT
    const newCenter = [
      (rotatedC[0] + clientX) / 2,
      (rotatedC[1] + clientY) / 2,
    ];

    const newBottomRight = rotateCenter(
      rotatedC[0],
      rotatedC[1],
      newCenter[0],
      newCenter[1],
      -rotate
    );

    const newTopLeft = rotateCenter(
      clientX,
      clientY,
      newCenter[0],
      newCenter[1],
      -rotate
    );

    const newX = newTopLeft[0];
    const newY = newTopLeft[1];
    const newCX = newCenter[0];
    const newCY = newCenter[1];
    const newWidth = newBottomRight[0] - newTopLeft[0];
    const newHeight = newBottomRight[1] - newTopLeft[1];
    return [newWidth, newHeight, newX, newY, newCX, newCY];
  }
};

export const getMidPoints = (element: Element): [number, number] => {
  if (
    element.type === ElementType.Rect ||
    element.type === ElementType.Text ||
    element.type === ElementType.Diamond ||
    element.type === ElementType.Ellipse
  ) {
    return [element.x + element.width / 2, element.y + element.height / 2];
  } else {
    // TODO: Implement this
    return [0, 0];
  }
};

export function copy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function debounce<Params extends any[]>(
  func: (...args: Params) => any,
  timeout: number
): (...args: Params) => void {
  let timer: NodeJS.Timeout;
  return (...args: Params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

export function angleBetweenPoints(
  cx: number,
  cy: number,
  ex: number,
  ey: number
) {
  var dy = ey - cy;
  var dx = ex - cx;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  //if (theta < 0) theta = 360 + theta; // range [0, 360)
  return Math.round(theta);
}

/**
 * is v1 a newer version as compared to v2
 * @param v1
 * @param v2
 * @returns boolean
 */
export function isNewerVersion(v1: UserVersion, v2: UserVersion) {
  return (
    v1.version > v2.version ||
    (v1.version === v2.version && v1.userId.localeCompare(v2.userId) < 0)
  );
}

// Find first overlapping outside border and return that element
export function findOverlappingElement(
  x: number,
  y: number,
  elements: Element[]
) {
  const element = elements.find((e) => {
    switch (e.type) {
      case ElementType.Rect:
      case ElementType.Text:
      case ElementType.Diamond:
        return isPointInsideRect(x, y, e, CONNECTING_BORDER_SIZE);
      case ElementType.Ellipse:
        const rx = e.width / 2;
        const ry = e.height / 2;
        const cx = e.x + rx;
        const cy = e.y + ry;
        const rotation = e.rotate;
        return isPointInsideEllipse(
          x,
          y,
          cx,
          cy,
          rx,
          ry,
          rotation,
          CONNECTING_BORDER_SIZE
        );
      default:
        return false;
    }
  });

  return element;
}
