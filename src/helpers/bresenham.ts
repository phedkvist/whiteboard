// Algorithm for getting all points between two points
// https://github.com/anushaihalapathirana/Bresenham-line-drawing-algorithm/blob/master/src/index.js

export function bresenham(
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  let outputArray = [];

  const dx = endX - startX;
  const dy = endY - startY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let x = startX;
  let y = startY;
  outputArray.push({ x, y }); // add starting points

  // slope < 1
  if (absDx > absDy) {
    let d = 2 * absDy - absDx;

    for (let i = 0; i < absDx; i++) {
      x = dx < 0 ? x - 1 : x + 1;
      if (d < 0) {
        d = d + 2 * absDy;
      } else {
        y = dy < 0 ? y - 1 : y + 1;
        d = d + (2 * absDy - 2 * absDx);
      }
      outputArray.push({ x, y });
    }
  } else {
    // case when slope is greater than or equals to 1
    let d = 2 * absDx - absDy;

    for (let i = 0; i < absDy; i++) {
      y = dy < 0 ? y - 1 : y + 1;
      if (d < 0) d = d + 2 * absDx;
      else {
        x = dx < 0 ? x - 1 : x + 1;
        d = d + 2 * absDx - 2 * absDy;
      }
      outputArray.push({ x, y });
    }
  }
  return outputArray;
}
