import { Ellipse } from "../types";
import { bresenham } from "./bresenham";

type Rect = { left: number; top: number; right: number; bottom: number };

export function isRectsIntersecting(r1: Rect, r2: Rect) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

export function isPointInsideRect(x: number, y: number, rect: Rect) {
  return isRectsIntersecting(
    {
      left: x,
      top: y,
      right: x,
      bottom: y,
    },
    rect
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
  return points.some((p) => isPointInsideRect(p.x, p.y, rect));
}

export function isPointInsideEllipse(
  x: number,
  y: number,
  ellipse: Ellipse,
  padding: number = 0
): boolean {
  const { cx, cy, rx, ry } = ellipse;
  const dx = x - cx;
  const dy = y - cy;
  const normalizedX = dx / (rx + padding);
  const normalizedY = dy / (ry + padding);
  const distanceFromCenter =
    Math.pow(normalizedX, 2) + Math.pow(normalizedY, 2);

  return distanceFromCenter <= 1;
}
