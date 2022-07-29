import { Corner, Element, Ellipse, Rect } from "./Types";

const getRectCorners = (rect: Rect) => {
  const { x, y, width: w, height: h } = rect;

  const topLeft = { corner: Corner.TopLeft, x, y };
  const topRight = { corner: Corner.TopRight, x: x + w, y };
  const bottomRight = {
    corner: Corner.BottomRight,
    x: x + w,
    y: y + h,
  };
  const bottomLeft = {
    corner: Corner.BottomLeft,
    x,
    y: y + h,
  };
  return {
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  };
};

const getEllipseCorners = (ellipse: Ellipse) => {
  const { cx, cy, rx, ry } = ellipse;

  const topLeft = { corner: Corner.TopLeft, x: cx - rx, y: cy - ry };
  const topRight = { corner: Corner.TopRight, x: cx + rx, y: cy - ry };
  const bottomLeft = { corner: Corner.BottomLeft, x: cx - rx, y: cy + ry };
  const bottomRight = { corner: Corner.BottomRight, x: cx + rx, y: cy + ry };
  return {
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  };
};

export const getClosestCorner = (
  element: Element | null,
  xPos: number,
  yPos: number
) => {
  if (!element || element.type === "text") return;
  const { topLeft, topRight, bottomRight, bottomLeft } =
    element.type === "rect"
      ? getRectCorners(element)
      : getEllipseCorners(element);

  let closestCorner = Corner.TopLeft;
  let dist = Infinity;
  [topLeft, topRight, bottomLeft, bottomRight].forEach(({ x, y, corner }) => {
    const d = Math.sqrt(Math.pow(x - xPos, 2) + Math.pow(y - yPos, 2));
    if (d < dist) {
      dist = d;
      closestCorner = corner;
    }
  });
  return closestCorner;
};
