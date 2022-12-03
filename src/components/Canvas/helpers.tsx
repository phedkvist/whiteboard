import "./Canvas.css";
import {
  SelectionModes,
  Element,
  ElementType,
  Rect,
  SelectionMode,
} from "../../types";
import { useAppState } from "../../context/AppState";
import { useMouseEvents } from "../../context/MouseEvents";
import { useEffect, useState } from "react";
import { copy } from "../../utility";
import { updateRectAction } from "../../services/Actions/Rect";
import History from "../../services/History";

const CORNER_OFFSET = 8;
export const getCornerCoords = (e: Element) => {
  if (e.type === ElementType.Rect) {
    return {
      tL: { x: e.x - CORNER_OFFSET, y: e.y - CORNER_OFFSET },
      tR: { x: e.x + e.width, y: e.y - CORNER_OFFSET },
      bR: { x: e.x + e.width, y: e.y + e.height },
      bL: { x: e.x - CORNER_OFFSET, y: e.y + e.height },
    };
  } else if (e.type === ElementType.Ellipse) {
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

export const DrawBackgroundLines = () => (
  <>
    {[
      0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
      1400, 1500, 1600,
    ].map((x) => (
      <g key={`g x-${x - 10}`}>
        <text x={x - 10} y={14} fontSize={8} key={`x-${x - 10}`}>
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
      <g key={`g y-${y - 10}`}>
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

export const addDraggableCorners = (
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
