import { Diamond, ElementType, Ellipse, Rect, Text } from "../../types";

// https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point
export const pointCloseToCorner = (
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

  for (let i = 0; i < coordinates.length; i++) {
    const curPoint = coordinates[i];

    if (i === 0) {
      // first point
      pathSegments.push(`M ${curPoint[0]} ${curPoint[1]}`);
    } else if (i === coordinates.length - 1) {
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

export function createRoundedRect(rect: Rect, radius = 10) {
  const { x, y, width, height } = rect;
  const pathSegments = [];
  pathSegments.push(`M ${x + radius} ${y} L ${x + width - radius} ${y}`);
  // top right corner
  pathSegments.push(`Q ${x + width} ${y}, ${x + width} ${y + radius}`);

  pathSegments.push(`L ${x + width} ${y + height - radius}`);

  // bottom right corner
  pathSegments.push(
    `Q ${x + width} ${y + height}, ${x + width - radius} ${y + height}`
  );
  pathSegments.push(`L ${x + radius} ${y + height}`);

  // bottom left corner
  pathSegments.push(`Q ${x} ${y + height}, ${x} ${y + height - radius}`);

  pathSegments.push(`L ${x} ${y + radius}`);

  // top left corner
  pathSegments.push(`Q ${x} ${y}, ${x + radius} ${y}`);

  return pathSegments.join(" ");
}

export function createRoundedDiamond(diamond: Diamond, radius = 10) {
  const { x, y, width: w, height: h } = diamond;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const a = [cx, cy - h / 2];
  const b = [cx + w / 2, cy];
  const c = [cx, cy + h / 2];
  const d = [cx - w / 2, cy];

  const pathSegments = [];
  pathSegments.push(
    `M ${a[0] + radius} ${a[1] + radius} L ${b[0] - radius} ${b[1] - radius}`
  );
  pathSegments.push(`Q ${b[0]} ${b[1]}, ${b[0] - radius} ${b[1] + radius}`);

  pathSegments.push(`L ${c[0] + radius} ${c[1] - radius}`);

  // bottom right corner
  pathSegments.push(`Q ${c[0]} ${c[1]}, ${c[0] - radius} ${c[1] - radius}`);

  pathSegments.push(`L ${d[0] + radius} ${d[1] + radius}`);

  // bottom left corner
  pathSegments.push(`Q ${d[0]} ${d[1]}, ${d[0] + radius} ${d[1] - radius}`);

  pathSegments.push(`L ${a[0] - radius} ${a[1] + radius}`);

  // top left corner
  pathSegments.push(`Q ${a[0]} ${a[1]}, ${a[0] + radius} ${a[1] + radius}`);

  return pathSegments.join(" ");
}

export const renderSvgElement = (
  element: Rect | Text | Diamond | Ellipse,
  classes: string
) => {
  const { type, id, style } = element;
  if (type === ElementType.Rect) {
    return (
      <path
        key={id}
        style={style}
        id={id}
        d={createRoundedRect(element)}
        className={classes}
        data-testid="rect-svg"
      />
    );
  } else if (type === ElementType.Diamond) {
    return (
      <path
        key={id}
        style={style}
        id={id}
        d={createRoundedDiamond(element)}
        className={classes}
        data-testid="diamond"
      />
    );
  } else if (type === ElementType.Text) {
    const { type, renderingOrder, userVersion, ...props } = element;
    return (
      <rect
        key={element.id}
        {...props}
        className={classes}
        data-testid="text"
      />
    );
  } else {
    const {
      type,
      renderingOrder,
      userVersion,
      x,
      y,
      width,
      height,
      rotate,
      ...props
    } = element;

    const rx = width / 2;
    const ry = height / 2;
    const cx = x + rx;
    const cy = y + ry;
    return (
      <ellipse
        key={id}
        rx={rx}
        ry={ry}
        cx={cx}
        cy={cy}
        {...props}
        className={classes}
        data-testid="circle-svg"
      />
    );
  }
};
