import { MouseEventHandler } from "react";
import "./Canvas.css";
import { SelectionModes, Element } from "../../Types";
import { useAppState } from "../../context/AppState";
import { useMouseEvents } from "../../context/MouseEvents";

const CORNER_OFFSET = 8;
const getCornerCoords = (e: Element) => {
  if (e.type === "rect") {
    return {
      tL: { x: e.x - CORNER_OFFSET, y: e.y - CORNER_OFFSET },
      tR: { x: e.x + e.width, y: e.y - CORNER_OFFSET },
      bR: { x: e.x + e.width, y: e.y + e.height },
      bL: { x: e.x - CORNER_OFFSET, y: e.y + e.height },
    };
  } else if (e.type === "ellipse") {
    return {
      tL: { x: e.cx - e.rx - CORNER_OFFSET, y: e.cy - e.ry - CORNER_OFFSET },
      tR: { x: e.cx + e.rx, y: e.cy - e.ry - CORNER_OFFSET },
      bR: { x: e.cx + e.rx, y: e.cy + e.ry },
      bL: { x: e.cx - e.rx - CORNER_OFFSET, y: e.cy + e.ry },
    };
  } else {
    return {
      tL: { x: 0, y: 0 },
      tR: { x: 0, y: 0 },
      bR: { x: 0, y: 0 },
      bL: { x: 0, y: 0 },
    };
  }
};

const DrawBackgroundLines = () => (
  <>
    {[
      0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
      1400, 1500, 1600,
    ].map((x) => (
      <g>
        <text x={x - 10} y={14} fontSize={8}>
          {x}
        </text>
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={1400}
          stroke="lightgray"
          strokeDasharray={5}
        />
      </g>
    ))}
    {[
      0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
      1400,
    ].map((y) => (
      <g>
        <text x={14} y={y} fontSize={8}>
          {y}
        </text>
        <line
          x1={0}
          y1={y}
          x2={1600}
          y2={y}
          stroke="lightgray"
          strokeDasharray={5}
        />
      </g>
    ))}
  </>
);

const addDraggableCorners = (
  renderElement: JSX.Element,
  id: string,
  midX: number,
  midY: number,
  tL: { x: number; y: number },
  tR: { x: number; y: number },
  bR: { x: number; y: number },
  bL: { x: number; y: number },
  rotate: number,
  isSelected: boolean
) => (
  <g key={`g-${id}`} transform={`rotate(${rotate}, ${midX}, ${midY})`}>
    {renderElement}
    {isSelected && (
      <>
        <circle
          id={`${id}-rotate`}
          r={5}
          cx={(tL.x + tR.x + CORNER_OFFSET) / 2}
          cy={tL.y - CORNER_OFFSET}
          style={{ cursor: "grabbing" }}
        />
        <rect
          id={`${id}-resize-top-left`}
          width={8}
          height={8}
          x={tL.x}
          y={tL.y}
          style={{ cursor: "nwse-resize" }}
          fill={"darkblue"}
        />
        <rect
          id={`${id}-resize-top-right`}
          width={8}
          height={8}
          x={tR.x}
          y={tR.y}
          style={{ cursor: "nesw-resize" }}
          fill={"darkblue"}
        />
        <rect
          id={`${id}-resize-bottom-right`}
          width={8}
          height={8}
          x={bR.x}
          y={bR.y}
          style={{ cursor: "nwse-resize" }}
          fill={"darkblue"}
        />
        <rect
          id={`${id}-resize-bottom-left`}
          width={8}
          height={8}
          x={bL.x}
          y={bL.y}
          style={{ cursor: "nesw-resize" }}
          fill={"darkblue"}
        />
      </>
    )}
  </g>
);

const Canvas = ({}: {}) => {
  const {
    appState,
    selectedElement,
    hoverElement,
    selectionMode,
    showDebugger,
  } = useAppState();
  const { onMouseOver, onMouseDown, onMouseMove, onMouseUp } = useMouseEvents();

  const { elements, renderingOrder } = appState;
  const sortedElements = Object.values(elements).sort((a, b) => {
    const val = a.renderingOrder - b.renderingOrder;

    if (val !== 0) return val;
    return Number(a.id > b.id);
  });
  const renderElements = sortedElements.map((e) => {
    const isSelected = e.id === selectedElement;
    const isSelectedCss = isSelected ? "isSelected" : "";
    const isHovering = !isSelected && e.id === hoverElement ? "isHovering" : "";
    const classes = `${e.state} ${isSelectedCss} ${isHovering}`;
    let renderElement;
    if (e.type === "rect") {
      const { type, ...props } = e;
      const { x, y, width, height, rotate } = props;
      renderElement = <rect {...props} className={classes} />;
      const { tL, tR, bR, bL } = getCornerCoords(e);
      return addDraggableCorners(
        renderElement,
        e.id,
        x + width / 2,
        y + height / 2,
        tL,
        tR,
        bR,
        bL,
        rotate,
        isSelected
      );
    } else if (e.type === "ellipse") {
      const { type, ...props } = e;
      const { cx, cy, rotate } = props;

      renderElement = <ellipse {...props} className={classes} />;
      const { tL, tR, bR, bL } = getCornerCoords(e);
      return addDraggableCorners(
        renderElement,
        e.id,
        cx,
        cy,
        tL,
        tR,
        bR,
        bL,
        rotate,
        isSelected
      );
    } else if (e.type === "polyline") {
      const { type, points, ...props } = e;
      renderElement = (
        <polyline
          {...props}
          points={points.toString()}
          className={classes}
        ></polyline>
      );
      return renderElement;
    } else {
      const { type, text, ...props } = e;
      renderElement = (
        <text {...props} className={classes}>
          {text}
        </text>
      );
      return renderElement;
    }
  });
  const isAdding = selectionMode.type === SelectionModes.Add;
  return (
    <svg
      className={`canvas ${isAdding ? "isAdding" : ""}`}
      id="container"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseOver={onMouseOver}
    >
      {renderElements}
      {showDebugger && <DrawBackgroundLines />}
    </svg>
  );
};

export default Canvas;
