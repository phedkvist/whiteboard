import { CSSProperties, LegacyRef, MouseEventHandler, MouseEvent } from "react";
import "./Canvas.css";
import { CanvasState, SelectionMode, SelectionModes } from "../../Types";

/*

  Basic
  ----
  ✅ Drag elements around
  Add different elements to canvas
  Add hover cursor when mouse is over element

  Advanced
  ----
  Handle zooming in/out
  Handle turning an element around
  Handle resizing an element
  Collaboration features
  ----
*/

const Canvas = ({
  canvasState,
  selectionMode,
  containerRef,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}: {
  canvasState: CanvasState;
  selectionMode: SelectionMode;
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
  const isAdding = selectionMode.type === SelectionModes.Add;
  return (
    <svg
      className={`canvas ${isAdding ? "isAdding" : ""}`}
      ref={containerRef}
      id="container"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {renderElements}
    </svg>
  );
};

export default Canvas;
