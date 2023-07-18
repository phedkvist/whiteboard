import { Ellipse, Rect as IRect, Text } from "../types";
import { bresenham } from "./bresenham";

type Rect = { left: number; top: number; right: number; bottom: number };

// TODO: Take in account a rotated rect
export function isRectsIntersecting(r1: Rect, r2: Rect) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

export function isLineInsideRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rect: Rect
) {
  const points = bresenham(x1, y1, x2, y2);
  return points.some((p) =>
    isRectsIntersecting(
      {
        left: p.x,
        top: p.y,
        right: p.x,
        bottom: p.y,
      },
      rect
    )
  );
}

export function isPointInsideEllipse(
  x: number,
  y: number,
  ellipse: Ellipse,
  padding: number = 0
): boolean {
  const { cx, cy, rx, ry, rotate } = ellipse;
  const radians = rotate * (Math.PI / 180);
  const cosAngle = Math.cos(radians);
  const sinAngle = Math.sin(radians);

  const dx = x - cx;
  const dy = y - cy;
  const rotatedX = (dx * cosAngle - dy * sinAngle) / (rx + padding);
  const rotatedY = (dx * sinAngle + dy * cosAngle) / (ry + padding);
  const distanceFromCenter = Math.pow(rotatedX, 2) + Math.pow(rotatedY, 2);

  return distanceFromCenter <= 1;
}

export function isPointInsideRect(
  pointX: number,
  pointY: number,
  element: IRect | Text,
  padding = 0
) {
  const {
    rotate,
    x: rectX,
    y: rectY,
    width: rectWidth,
    height: rectHeight,
  } = element;
  // Convert the angle to radians
  const angleRad = rotate * (Math.PI / 180);

  // Translate the point to the rectangle's local coordinate system
  const translatedPointX = pointX - (rectX + rectWidth / 2);
  const translatedPointY = pointY - (rectY + rectHeight / 2);

  // Rotate the point around the rectangle's center in the opposite direction
  const rotatedPointX =
    Math.cos(-angleRad) * translatedPointX -
    Math.sin(-angleRad) * translatedPointY;
  const rotatedPointY =
    Math.sin(-angleRad) * translatedPointX +
    Math.cos(-angleRad) * translatedPointY;

  // Calculate the half-width and half-height of the rotated rectangle
  const halfWidth = rectWidth / 2 + padding;
  const halfHeight = rectHeight / 2 + padding;

  // Check if the rotated point is within the bounds of the rotated rectangle
  if (
    rotatedPointX >= -halfWidth &&
    rotatedPointX <= halfWidth &&
    rotatedPointY >= -halfHeight &&
    rotatedPointY <= halfHeight
  ) {
    return true;
  }

  return false;
}
