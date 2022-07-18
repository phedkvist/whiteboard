import { CSSProperties } from "react";

/*

  Basic
  ----
  Add different elements to canvas

  Advanced
  ----
  Handle zooming in/out
  Handle turning an element around
  Handle resizing an element

  Collaboration
  ----
*/

interface Circle {
  id: string;
  type: "circle";
  style?: CSSProperties;
  cx: number;
  cy: number;
  r: number;
}

interface Rect {
  id: string;
  type: "rect";
  width: number;
  height: number;
  style?: CSSProperties;
  rx?: number;
  ry?: number;
  x: number;
  y: number;
}

type Element = Circle | Rect;

export interface CanvasState {
  elements: {
    [id: string]: Element;
  };
}

const Canvas = ({
  canvasState,
  onClick,
}: {
  canvasState: CanvasState;
  onClick: (e: React.MouseEvent<SVGElement>) => void;
}) => {
  const { elements } = canvasState;
  const renderElements = Object.values(elements).map((e) => {
    if (e.type === "rect") {
      const { type, ...props } = e;
      return <rect {...props} onClick={onClick} />;
    } else {
      const { type, ...props } = e;

      return <circle {...props} onClick={onClick} />;
    }
  });
  return (
    <svg height="1000" width="1000">
      {renderElements}
    </svg>
  );
};

export default Canvas;
