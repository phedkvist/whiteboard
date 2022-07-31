import { LegacyRef, MouseEventHandler } from "react";
import "./Canvas.css";
import { AppState, SelectionMode, SelectionModes, Element } from "../../Types";
import { useAppState } from "../../context/AppState";

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

const Canvas = ({
  onMouseOver,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}: {
  onMouseOver: MouseEventHandler<SVGSVGElement>;
  onMouseDown: MouseEventHandler<SVGSVGElement>;
  onMouseUp: MouseEventHandler<SVGSVGElement>;
  onMouseMove: MouseEventHandler<SVGSVGElement>;
}) => {
  const { appState, selectedElement, hoverElement, selectionMode } =
    useAppState();
  const { elements } = appState;
  const renderElements = Object.values(elements).map((e) => {
    const isSelected = e.id === selectedElement ? "isSelected" : "";
    const isHovering = !isSelected && e.id === hoverElement ? "isHovering" : "";
    const classes = `${e.state} ${isSelected} ${isHovering}`;
    let renderElement;
    if (e.type === "rect") {
      const { type, ...props } = e;
      renderElement = <rect {...props} className={classes} />;
    } else if (e.type === "ellipse") {
      const { type, ...props } = e;

      renderElement = <ellipse {...props} className={classes} />;
    } else if (e.type === "text") {
      const { type, text, ...props } = e;
      renderElement = (
        <text {...props} className={classes}>
          {text}
        </text>
      );
    }
    if (isSelected && ["rect", "ellipse"].includes(e.type)) {
      const { tL, tR, bR, bL } = getCornerCoords(e);
      return (
        <g>
          {renderElement}
          <rect
            id={`${e.id}-resize-top-left`}
            x={tL.x}
            y={tL.y}
            width={8}
            height={8}
            style={{ cursor: "nwse-resize" }}
            fill={"darkblue"}
          />
          <rect
            id={`${e.id}-resize-top-right`}
            x={tR.x}
            y={tR.y}
            width={8}
            height={8}
            style={{ cursor: "nesw-resize" }}
            fill={"darkblue"}
          />
          <rect
            id={`${e.id}-resize-bottom-right`}
            x={bR.x}
            y={bR.y}
            width={8}
            height={8}
            style={{ cursor: "nwse-resize" }}
            fill={"darkblue"}
          />
          <rect
            id={`${e.id}-resize-bottom-left`}
            x={bL.x}
            y={bL.y}
            width={8}
            height={8}
            style={{ cursor: "nesw-resize" }}
            fill={"darkblue"}
          />
        </g>
      );
    } else {
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
    </svg>
  );
};

export default Canvas;
