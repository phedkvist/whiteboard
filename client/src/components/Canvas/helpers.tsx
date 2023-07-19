// https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point
const pointCloseToCorner = (
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  distanceFromCorner: number
) => {
  const d = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
  const t = distanceFromCorner / d;
  return {
    x: (1 - t) * x0 + t * x1,
    y: (1 - t) * y0 + t * y1,
  };
};

export function createRoundedLine(
  coordinates: [number, number][],
  radius: number = 20
): string {
  const pathSegments = [];

  const numCoordinates = coordinates.length;
  const lastCoordinate = coordinates[numCoordinates - 1];

  for (let i = 0; i < coordinates.length; i++) {
    const curPoint = coordinates[i];

    if (i === 0) {
      // first point
      pathSegments.push(`M ${curPoint[0]} ${curPoint[1]}`);
    } else if (i === numCoordinates - 1) {
      // last point
      pathSegments.push(`L ${curPoint[0]} ${curPoint[1]}`);
    } else {
      const prevPoint = coordinates[i - 1];
      const nextPoint = coordinates[i + 1];
      const firstPoint = pointCloseToCorner(...curPoint, ...prevPoint, radius);
      const secondPoint = pointCloseToCorner(...curPoint, ...nextPoint, radius);
      // Quadratic bezier curve: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
      pathSegments.push(
        `L ${firstPoint.x} ${firstPoint.y} Q ${curPoint[0]} ${curPoint[1]}, ${secondPoint.x} ${secondPoint.y}`
      );
    }
  }

  return pathSegments.join(" ");
}
