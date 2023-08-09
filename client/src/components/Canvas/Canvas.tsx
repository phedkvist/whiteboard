import "./Canvas.css";
import React from "react";
import { SelectionModes, ElementType, SelectionCoordinates } from "../../types";
import { useAppState } from "../../context/AppState";
import { useMouseEvents } from "../../context/MouseEvents/MouseEvents";
import Elements from "./Elements";
import Cursors from "../Cursors/Cursors";

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
  const { onMouseOver, onMouseDown, onMouseMove, onMouseUp } = useMouseEvents();

  const { elements } = appState;
  const sortedElements = Object.values(elements).sort((a, b) => {
    const val = a.renderingOrder - b.renderingOrder;

    if (val !== 0) return val;
    return Number(a.id > b.id);
  });

  const isAddingPolyline =
    selectionMode.elementType === ElementType.Polyline &&
    selectionMode.type === SelectionModes.Add;
  const isSelectingPolyline = selectedElements.some(
    (id) => appState.elements[id]?.type === ElementType.Polyline
  );
  // Should this only be displayed whenever one tries to connect to an element,
  // not just always
  const isEditingPolyline = isSelectingPolyline || isAddingPolyline;

  const renderElements = sortedElements.map((e) => {
    const isSelected = selectedElements.includes(e.id);
    const isSelectedCss = isSelected ? "isSelected" : "";
    const isHovering = !isSelected && e.id === hoverElement ? "isHovering" : "";
    const classes = `${e.state} ${isSelectedCss} ${isHovering}`;
    if (
      e.type === ElementType.Rect ||
      e.type === ElementType.Text ||
      e.type === ElementType.Diamond ||
      e.type === ElementType.Ellipse
    ) {
      return (
        <Elements.Square
          key={e.id}
          isSelected={isSelected}
          classes={classes}
          selectionMode={selectionMode}
          element={e}
          history={history}
          isEditingPolyline={isEditingPolyline}
        />
      );
    } else {
      return (
        <Elements.Polyline
          key={e.id}
          isSelected={isSelected}
          classes={classes}
          polyline={e}
          elements={elements}
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
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      width={window.innerWidth}
      height={window.innerHeight}
      data-testid="canvas"
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
