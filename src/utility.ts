import { Corner, Element, Ellipse, Rect } from "./Types";

export enum MouseButtons {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
}

const rotateVector = (xy: [number, number], theta: number) => {
  const [x, y] = xy;
  return [
    Math.cos((theta * Math.PI) / 180) * x -
      Math.sin((theta * Math.PI) / 180) * y,
    Math.sin((theta * Math.PI) / 180) * x +
      Math.cos((theta * Math.PI) / 180) * y,
  ];
};

const getElementCorners = (
  x: number,
  y: number,
  w: number,
  h: number,
  rotate: number
) => {
  // Let mid point be the center
  // Rotate each corner and treat as a vector.
  // Get the rotated vector into the current coordinate system
  // Should be able to get coordinates by adding the mid points to the rotated vector.
  const [cx, cy] = [x + w / 2, y + h / 2];

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
    x: rotatedTl[0] + cx,
    y: rotatedTl[1] + cy,
  };
  const topRight = {
    corner: Corner.TopRight,
    x: rotatedTr[0] + cx,
    y: rotatedTr[1] + cy,
  };
  const bottomRight = {
    corner: Corner.BottomRight,
    x: rotatedBr[0] + cx,
    y: rotatedBr[1] + cy,
  };
  const bottomLeft = {
    corner: Corner.BottomLeft,
    x: rotatedBl[0] + cx,
    y: rotatedBl[1] + cy,
  };
  return {
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  };
};

export const getClosestCorner = (
  e: Element | null,
  xPos: number,
  yPos: number
) => {
  if (!e || e.type === "text" || e.type === "polyline") return;
  const { topLeft, topRight, bottomRight, bottomLeft } =
    e.type === "rect"
      ? getElementCorners(e.x, e.y, e.width, e.height, e.rotate)
      : getElementCorners(
          e.cx - e.rx,
          e.cy - e.ry,
          2 * e.rx,
          2 * e.ry,
          e.rotate
        );

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
  console.log("CLOSEST CORNER: ", closestCorner);
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

export const resizeRect = (
  selectedCorner: Corner,
  clientX: number,
  clientY: number,
  rect: Rect
) => {
  const { x, y, width: w, height: h, rotate } = rect;

  const cx = x + w / 2;
  const cy = y + h / 2;

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

export const resizeEllipse = (
  selectedCorner: Corner,
  clientX: number,
  clientY: number,
  ellipse: Ellipse
) => {
  const { cx, cy, rx, ry, rotate } = ellipse;

  const x = cx - rx;
  const y = cy - ry;
  const w = 2 * rx;
  const h = 2 * ry;
  const [newWidth, newHeight, _newX, _newY, newCX, newCY] =
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
  return [newWidth, newHeight, newCX, newCY];
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
  if (element.type === "rect") {
    return [element.x + element.width / 2, element.y + element.height / 2];
  } else if (element.type === "ellipse") {
    return [element.cx, element.cy];
  } else {
    // TODO: Implement this
    return [0, 0];
  }
};
