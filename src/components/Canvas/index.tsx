import "./Canvas.css";
import { SelectionModes, ElementType, SelectionCoordinates } from "../../types";
import { useAppState } from "../../context/AppState";
import { useMouseEvents } from "../../context/MouseEvents";
import Elements from "./Elements";
import Cursors from "./Cursors";

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

const MultiSelectBox = ({
  selectionCoordinates,
}: {
  selectionCoordinates: SelectionCoordinates;
}) => {
  const { startX, startY, currentX, currentY } = selectionCoordinates;
  if (!startX || !startY || !currentX || !currentY) return null;
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  return (
    <rect className="multiSelect" x={x} y={y} width={width} height={height} />
  );
};

const Canvas = () => {
  const {
    appState,
    selectedElements,
    hoverElement,
    selectionMode,
    showDebugger,
    viewBox,
    history,
    selectionCoordinates,
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
    const isSelected = selectedElements.includes(e.id);
    const isSelectedCss = isSelected ? "isSelected" : "";
    const isHovering = !isSelected && e.id === hoverElement ? "isHovering" : "";
    const classes = `${e.state} ${isSelectedCss} ${isHovering}`;
    if (e.type === ElementType.Rect) {
      return (
        <Elements.Rect
          key={e.id}
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
          key={e.id}
          isSelected={isSelected}
          classes={classes}
          ellipse={e}
          history={history}
          selectionMode={selectionMode}
        />
      );
    } else if (e.type === ElementType.Polyline) {
      return (
        <Elements.Polyline
          key={e.id}
          isSelected={isSelected}
          classes={classes}
          polyline={e}
        />
      );
    } else {
      return (
        <Elements.Text
          key={e.id}
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
  const showMultiSelect = selectionMode.type === SelectionModes.MultiSelecting;
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
      {showMultiSelect && (
        <MultiSelectBox selectionCoordinates={selectionCoordinates} />
      )}
      <Cursors cursors={Object.values(appState.cursors)} />
    </svg>
  );
};

export default Canvas;
