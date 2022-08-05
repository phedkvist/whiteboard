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

function rotateCenter(
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
  initialWidth: number,
  initialHeight: number,
  initialX: number,
  initialY: number,
  clientX: number,
  clientY: number,
  rect: Rect
): [number, number, number | null, number | null] => {
  // TODO: TAKE ROTATION INTO ACCOUNT FOR INITIAL X,Y AND CLIENT X,Y
  // THESE POINTS NEED TO BE TREATED AS VECTORS THEN CONVERTED BACK TO POINTS.
  const { x, y, width, height, rotate } = rect;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const rotatedA = rotateCenter(x, y, cx, cy, rotate); // calculate A'
  const rotatedB = rotateCenter(x + width, y, cx, cy, rotate); // calculate A'

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
    console.log(newTopLeft);
    const newX = newTopLeft[0];
    const newY = newTopLeft[1];
    const newWidth = newBottomRight[0] - newTopLeft[0];
    const newHeight = newBottomRight[1] - newTopLeft[1];
    return [newWidth, newHeight, newX, newY];
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
