import "./Canvas.css";
import {
  SelectionModes,
  Element,
  ElementType,
  Rect,
  SelectionMode,
  Ellipse,
} from "../../types";
import { useAppState } from "../../context/AppState";
import { useMouseEvents } from "../../context/MouseEvents";
import { useEffect, useRef, useState } from "react";
import { copy } from "../../utility";
import { updateRectAction } from "../../services/Actions/Rect";
import History from "../../services/History";
import {
  addDraggableCorners,
  DrawBackgroundLines,
  getCornerCoords,
} from "./helpers";

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

  if (!history) return null;

  const renderElements = sortedElements.map((e) => {
    const isSelected = e.id === selectedElement;
    const isSelectedCss = isSelected ? "isSelected" : "";
    const isHovering = !isSelected && e.id === hoverElement ? "isHovering" : "";
    const classes = `${e.state} ${isSelectedCss} ${isHovering}`;
    let renderElement;
    if (e.type === ElementType.Rect) {
      return (
        <RenderRect
          e={e}
          isSelected={isSelected}
          selectionMode={selectionMode}
          classes={classes}
          history={history}
        />
      );
    } else if (e.type === ElementType.Ellipse) {
      <RenderEllipse e={e} classes={classes} isSelected={isSelected} />;
    } else if (e.type === ElementType.Polyline) {
      const { type, renderingOrder, points, ...props } = e;
      renderElement = (
        <polyline
          key={e.id}
          {...props}
          points={points.toString()}
          className={classes}
        ></polyline>
      );
      return renderElement;
    } else {
      const { type, renderingOrder, text, ...props } = e;
      renderElement = (
        <text key={e.id} {...props} className={classes}>
          {text}
        </text>
      );
      return renderElement;
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

const RenderEllipse = ({
  e,
  classes,
  isSelected,
}: {
  e: Ellipse;
  classes: string;
  isSelected: boolean;
}) => {
  const { type, renderingOrder, ...props } = e;
  const { cx, cy, rotate, text } = props;

  const renderElement = (
    <ellipse key={e.id} {...props} className={classes}>
      <text>{text}</text>
    </ellipse>
  );
  const { tL, tR, bR, bL } = getCornerCoords(e);
  return addDraggableCorners(
    renderElement,
    e.id,
    cx,
    cy,
    tL,
    tR,
    bR,
    bL,
    rotate,
    isSelected
  );
};

const RenderRect = ({
  e,
  isSelected,
  selectionMode,
  classes,
  history,
}: {
  e: Rect;
  isSelected: boolean;
  selectionMode: SelectionMode;
  classes: string;
  history: History;
}) => {
  const isEditable = !(
    isSelected && selectionMode.type === SelectionModes.TextEditing
  );
  const { type, renderingOrder, ...props } = e;
  const { x, y, width, height, rotate } = props;

  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (e) {
      setText(e.text);
    }
  }, [e]);

  const onChangeInput: React.ChangeEventHandler<HTMLTextAreaElement> = (
    event
  ) => {
    setText(event.target.value);
    const element = copy(e);
    if (element && element.type === ElementType.Rect && history) {
      const changeAction = updateRectAction(
        { ...element, text: event.target.value },
        false
      );
      // TODO: Consider using debounce here.
      history.addLocalChange(changeAction);
    }
  };

  const renderElement = (
    <g>
      <rect key={e.id} {...props} className={classes} />
      <foreignObject
        fontSize={14}
        x={x}
        y={y}
        width={width}
        height={height}
        alignmentBaseline="middle"
        textAnchor="middle"
        id={e.id}
      >
        <div
          className="textContainer"
          data-xmlns="http://www.w3.org/1999/xhtml"
        >
          <textarea
            ref={ref}
            className="textInput"
            id={e.id}
            disabled={isEditable}
            value={text}
            onChange={onChangeInput}
          />
        </div>
      </foreignObject>
    </g>
  );
  const { tL, tR, bR, bL } = getCornerCoords(e);
  return addDraggableCorners(
    renderElement,
    e.id,
    x + width / 2,
    y + height / 2,
    tL,
    tR,
    bR,
    bL,
    rotate,
    isSelected
  );
};

export default Canvas;
