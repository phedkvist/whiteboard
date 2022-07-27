import { Corner, Element } from "./Types";

export const getClosestCorner = (
  element: Element | null,
  xPos: number,
  yPos: number
) => {
  if (!element || element.type !== "rect") return;
  const { x, y, width, height } = element;
  const topLeft = { corner: Corner.TopLeft, x, y };
  const topRight = { corner: Corner.TopRight, x: x + width, y };
  const bottomRight = {
    corner: Corner.BottomRight,
    x: x + width,
    y: y + height,
  };
  const bottomLeft = {
    corner: Corner.BottomLeft,

    x,
    y: y + height,
  };
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
