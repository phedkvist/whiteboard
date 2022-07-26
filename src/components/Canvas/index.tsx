import { LegacyRef, MouseEventHandler } from "react";
import "./Canvas.css";
import { CanvasState, SelectionMode, SelectionModes } from "../../Types";

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
    if (isSelected && e.type === "rect") {
      return (
        <g>
          {renderElement}
          <rect
            id={`${e.id}-resize-top-left`}
            x={e.x - 8}
            y={e.y - 8}
            width={8}
            height={8}
            fill={"darkblue"}
          />
          <rect
            id={`${e.id}-resize-top-right`}
            x={e.x + e.width}
            y={e.y - 8}
            width={8}
            height={8}
            fill={"darkblue"}
          />
          <rect
            id={`${e.id}-resize-bottom-right`}
            x={e.x + e.width}
            y={e.y + e.height}
            width={8}
            height={8}
            fill={"darkblue"}
          />
          <rect
            id={`${e.id}-resize-bottom-left`}
            x={e.x - 8}
            y={e.y + e.height}
            width={8}
            height={8}
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
