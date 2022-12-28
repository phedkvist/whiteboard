import "./Canvas.css";
import { SelectionModes, Element, ElementType } from "../../types";
import { useAppState } from "../../context/AppState";
import { useMouseEvents } from "../../context/MouseEvents";
import Elements from "./Elements";

const DrawBackgroundLines = () => (
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

const Canvas = () => {
  const {
    appState,
    selectedElement,
    hoverElement,
    selectionMode,
    showDebugger,
    viewBox,
    history,
  } = useAppState();
  const { onMouseOver, onMouseDown, onMouseMove, onMouseUp, onMouseWheel } =
    useMouseEvents();

  const { elements } = appState;
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
    if (e.type === ElementType.Rect) {
      return (
        <Elements.Rect
          isSelected={isSelected}
          classes={classes}
          selectionMode={selectionMode}
          rect={e}
          history={history}
        />
      );
    } else if (e.type === ElementType.Ellipse) {
      return (
        <Elements.Ellipse
          isSelected={isSelected}
          classes={classes}
          ellipse={e}
          history={history}
          selectionMode={selectionMode}
        />
      );
    } else if (e.type === ElementType.Polyline) {
      return <Elements.Polyline classes={classes} polyline={e} />;
    } else {
      return (
        <Elements.Text
          isSelected={isSelected}
          classes={classes}
          selectionMode={selectionMode}
          textElement={e}
          history={history}
        />
      );
    }
  });
  const isAdding = selectionMode.type === SelectionModes.Add;
  return (
    <svg
      data-xmlns="http://www.w3.org/2000/svg"
      className={`canvas ${isAdding ? "isAdding" : ""}`}
      id="container"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onMouseOver={onMouseOver}
      onWheel={onMouseWheel}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
    >
      {showDebugger && <DrawBackgroundLines />}
      {renderElements}
    </svg>
  );
};

export default Canvas;
