import { Corner, Element, Ellipse, Rect } from "./Types";

const rotateVector = (xy: [number, number], theta: number) => {
  const [x, y] = xy;
  return [
    Math.cos((theta * Math.PI) / 180) * x -
      Math.sin((theta * Math.PI) / 180) * y,
    Math.sin((theta * Math.PI) / 180) * x +
      Math.cos((theta * Math.PI) / 180) * y,
  ];
};

const getRectCorners = (rect: Rect) => {
  const { x, y, width: w, height: h, rotate } = rect;
  // Let mid point be the center
  // Rotate each corner and treat as a vector.
  // Get the rotated vector into the current coordinate system
  // Should be able to get coordinates by adding the mid points to the rotated vector.

  const [midPointX, midPointY] = [x + w / 2, y + h / 2];

  const topLeftVector: [number, number] = [-w / 2, -h / 2];
  const rotatedTl = rotateVector(topLeftVector, rotate);

  const topRightVector: [number, number] = [w / 2, -h / 2];
  const rotatedTr = rotateVector(topRightVector, rotate);

  const bottomRightVector: [number, number] = [w / 2, h / 2];
  const rotatedBr = rotateVector(bottomRightVector, rotate);

  const bottomLeftVector: [number, number] = [-w / 2, h / 2];
  const rotatedBl = rotateVector(bottomLeftVector, rotate);

  const topLeft = {
    corner: Corner.TopLeft,
    x: rotatedTl[0] + midPointX,
    y: rotatedTl[1] + midPointY,
  };
  const topRight = {
    corner: Corner.TopRight,
    x: rotatedTr[0] + midPointX,
    y: rotatedTr[1] + midPointY,
  };
  const bottomRight = {
    corner: Corner.BottomRight,
    x: rotatedBr[0] + midPointX,
    y: rotatedBr[1] + midPointY,
  };
  const bottomLeft = {
    corner: Corner.BottomLeft,
    x: rotatedBl[0] + midPointX,
    y: rotatedBl[1] + midPointY,
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
  // TODO: Replace with reduce to get a functional pattern instead
  [topLeft, topRight, bottomLeft, bottomRight].forEach(({ x, y, corner }) => {
    const d = Math.sqrt(Math.pow(x - xPos, 2) + Math.pow(y - yPos, 2));
    if (d < dist) {
      dist = d;
      closestCorner = corner;
    }
  });
  return closestCorner;
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

// https://shihn.ca/posts/2020/resizing-rotated-elements/
export const resizeRect = (
  selectedCorner: Corner,
  clientX: number,
  clientY: number,
  rect: Rect
): [number, number, number | null, number | null] => {
  const { x, y, width, height, rotate } = rect;

  const cx = x + width / 2;
  const cy = y + height / 2;
  /*
  A = top left corner
  B = top right corner
  C = bottom right corner
  D = bottom left corner
  */

  const rotatedA = rotateCenter(x, y, cx, cy, rotate);
  const rotatedB = rotateCenter(x + width, y, cx, cy, rotate);
  const rotatedC = rotateCenter(x + width, y + height, cx, cy, rotate);
  const rotatedD = rotateCenter(x, y + height, cx, cy, rotate);

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
    const newWidth = newBottomRight[0] - newTopLeft[0];
    const newHeight = newBottomRight[1] - newTopLeft[1];
    return [newWidth, newHeight, newX, newY];
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

    return [newWidth, newHeight, newX, newY];
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
    const newWidth = newTopRight[0] - newBottomLeft[0];
    const newHeight = newBottomLeft[1] - newTopRight[1];
    return [newWidth, newHeight, newX, newY];
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
    const newWidth = newBottomRight[0] - newTopLeft[0];
    const newHeight = newBottomRight[1] - newTopLeft[1];
    return [newWidth, newHeight, newX, newY];
  }
};

export const resizeEllipse = (
  selectedCorner: Corner,
  clientX: number,
  clientY: number,
  ellipse: Ellipse
): [number, number, number | null, number | null] => {
  const { cx, cy, rx, ry, rotate } = ellipse;

  const x = cx - rx;
  const y = cy - ry;

  const rotatedA = rotateCenter(x, y, cx, cy, rotate);
  const rotatedB = rotateCenter(x + 2 * rx, y, cx, cy, rotate);
  const rotatedC = rotateCenter(x + 2 * rx, y + 2 * ry, cx, cy, rotate);
  const rotatedD = rotateCenter(x, y + 2 * ry, cx, cy, rotate);

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
    const newCX = newCenter[0];
    const newCY = newCenter[1];
    const newRX = newBottomRight[0] - newTopLeft[0];
    const newRY = newBottomRight[1] - newTopLeft[1];
    return [newRX, newRY, newCX, newCY];
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
    const newRX = newTopRight[0] - newBottomLeft[0];
    const newRY = newBottomLeft[1] - newTopRight[1];
    const newCX = newCenter[0];
    const newCY = newCenter[1];

    return [newRX, newRY, newCX, newCY];
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

    const newCX = newCenter[0];
    const newCY = newCenter[1];
    const newRX = newTopRight[0] - newBottomLeft[0];
    const newRY = newBottomLeft[1] - newTopRight[1];
    return [newRX, newRY, newCX, newCY];
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

    const newCX = newCenter[0];
    const newCY = newCenter[1];
    const newRX = newBottomRight[0] - newTopLeft[0];
    const newRY = newBottomRight[1] - newTopLeft[1];
    return [newRX, newRY, newCX, newCY];
  }
};

export const getMidPoints = (element: Element): [number, number] => {
  if (element.type === "rect") {
    return [element.x + element.width / 2, element.y + element.height / 2];
  } else if (element.type === "ellipse") {
    return [element.cx, element.cy];
  } else {
    // TODO: Implement this
    return [0, 0];
  }
};
