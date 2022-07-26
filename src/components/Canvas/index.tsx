import { LegacyRef, MouseEventHandler } from "react";
import "./Canvas.css";
import { CanvasState, SelectionMode, SelectionModes } from "../../Types";

/*

  Basic
  ----
  ✅ Drag elements around
  ✅ Add basic elements to canvas (rect, ellipse)
  ✅ Add hover cursor when mouse is over element
  ✅ Add text element to canvas
  Add element property settings on the left handside
  Change color of element on canvas


  Advanced
  ----
  Handle zooming in/out
  Handle turning an element around
  Handle resizing an element
  Add history logs
  Add undo/redo of operations
  Collaboration features
  ----
*/

const Canvas = ({
  canvasState,
  selectionMode,
  selectedElement,
  hoverElement,
  containerRef,
  onMouseOver,
  onMouseDown,
  onMouseUp,
  onMouseMove,
}: {
  canvasState: CanvasState;
  selectionMode: SelectionMode;
  selectedElement: string | null;
  hoverElement: string | null;
  containerRef: LegacyRef<SVGSVGElement>;
  onMouseOver: MouseEventHandler<SVGSVGElement>;
  onMouseDown: MouseEventHandler<SVGSVGElement>;
  onMouseUp: MouseEventHandler<SVGSVGElement>;
  onMouseMove: MouseEventHandler<SVGSVGElement>;
}) => {
  const { elements } = canvasState;
  const renderElements = Object.values(elements).map((e) => {
    const isSelected = e.id === selectedElement ? "isSelected" : "";
    const isHovering = !isSelected && e.id === hoverElement ? "isHovering" : "";
    const classes = `${e.state} ${isSelected} ${isHovering}`;
    if (e.type === "rect") {
      const { type, ...props } = e;
      return <rect {...props} className={classes} />;
    } else if (e.type === "ellipse") {
      const { type, ...props } = e;

      return <ellipse {...props} className={classes} />;
    } else if (e.type === "text") {
      const { type, text, ...props } = e;
      return (
        <text {...props} className={classes}>
          {text}
        </text>
      );
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
      onMouseOver={onMouseOver}
    >
      {renderElements}
    </svg>
  );
};

export default Canvas;
