import { CSSProperties, LegacyRef, MouseEventHandler, MouseEvent } from "react";

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
  containerRef,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}: {
  canvasState: CanvasState;
  onClick: (e: MouseEvent<SVGElement>) => void;
  containerRef: LegacyRef<SVGSVGElement>;
  onMouseDown: MouseEventHandler<SVGSVGElement>;
  onMouseUp: MouseEventHandler<SVGSVGElement>;
  onMouseMove: MouseEventHandler<SVGSVGElement>;
}) => {
  const { elements } = canvasState;
  const renderElements = Object.values(elements).map((e) => {
    if (e.type === "rect") {
      const { type, ...props } = e;
      return <rect {...props} />;
    } else {
      const { type, ...props } = e;

      return <circle {...props} />;
    }
  });
  return (
    <svg
      ref={containerRef}
      id="container"
      height="1000"
      width="1000"
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {renderElements}
    </svg>
  );
};

export default Canvas;
