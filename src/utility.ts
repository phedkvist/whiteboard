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

export const resizeRect = (
  selectedCorner: Corner,
  initialWidth: number,
  initialHeight: number,
  initialX: number,
  initialY: number,
  clientX: number,
  clientY: number
): [number, number, number | null, number | null] => {
  if (selectedCorner === Corner.BottomRight) {
    const newWidth = initialWidth + clientX - initialX;
    const newHeight = initialHeight + clientY - initialY;
    return [newWidth, newHeight, null, null];
  } else if (selectedCorner === Corner.BottomLeft) {
    const newWidth = initialWidth - (clientX - initialX);
    const newHeight = initialHeight + clientY - initialY;
    const newX = clientX;
    return [newWidth, newHeight, newX, null];
  } else if (selectedCorner === Corner.TopRight) {
    const newWidth = initialWidth + clientX - initialX;
    const newHeight = initialHeight - (clientY - initialY);
    const newY = clientY;
    return [newWidth, newHeight, null, newY];
  } else {
    // TOP LEFT
    const newWidth = initialWidth - (clientX - initialX);
    const newHeight = initialHeight - (clientY - initialY);
    const newX = clientX;
    const newY = clientY;
    return [newWidth, newHeight, newX, newY];
  }
};

export const resizeEllipse = (
  selectedCorner: Corner,
  xOffset: number,
  yOffset: number,
  initialWidth: number,
  initialHeight: number,
  initialX: number,
  initialY: number,
  clientX: number,
  clientY: number
): [number, number, number | null, number | null] => {
  if (selectedCorner === Corner.BottomRight) {
    const newWidth = initialWidth + clientX - initialX;
    const newHeight = initialHeight + clientY - initialY;
    const newCX = xOffset + newWidth / 2;
    const newCY = yOffset + newHeight / 2;
    return [newWidth, newHeight, newCX, newCY];
  } else if (selectedCorner === Corner.BottomLeft) {
    const newWidth = initialWidth - (clientX - initialX);
    const newHeight = initialHeight + clientY - initialY;
    const newCX = clientX + newWidth / 2;
    const newCY = clientY - newHeight / 2;
    return [newWidth, newHeight, newCX, newCY];
  } else if (selectedCorner === Corner.TopRight) {
    const newWidth = initialWidth + clientX - initialX;
    const newHeight = initialHeight - (clientY - initialY);
    const newCX = xOffset + newWidth / 2;
    const newCY = clientY + newHeight / 2;
    return [newWidth, newHeight, newCX, newCY];
  } else {
    const newWidth = initialWidth - (clientX - initialX);
    const newHeight = initialHeight - (clientY - initialY);
    const newCX = clientX + newWidth / 2;
    const newCY = clientY + newHeight / 2;
    return [newWidth, newHeight, newCX, newCY];
  }
};
