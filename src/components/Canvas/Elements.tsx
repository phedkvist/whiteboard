import { useEffect, useState } from "react";
import {
  SelectionModes,
  SelectionMode,
  Element,
  Rect,
  ElementType,
  Ellipse,
  Polyline,
} from "../../types";
import { copy } from "../../utility";
import { updateRectAction } from "../../services/Actions/Rect";
import History from "../../services/History";

const CORNER_OFFSET = 8;
const getCornerCoords = (e: Element) => {
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

const addDraggableCorners = (
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

const RectRenderer = ({
  isSelected,
  selectionMode,
  classes,
  rect,
  history,
}: {
  isSelected: boolean;
  selectionMode: SelectionMode;
  classes: string;
  rect: Rect;
  history: History | null;
}) => {
  const [text, setText] = useState(rect.text);

  useEffect(() => {
    if (rect.text !== text) {
      setText(rect.text);
    }
  }, [rect]);

  const onChangeInput: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setText(e.target.value);
    const element = copy(rect);
    if (element && history) {
      const changeAction = updateRectAction(
        { ...element, text: e.target.value },
        false
      );
      // TODO: Consider using debounce here.
      history.addLocalChange(changeAction);
    }
  };

  const isEditable = !(
    isSelected && selectionMode.type === SelectionModes.TextEditing
  );
  const { type, renderingOrder, ...props } = rect;
  const { x, y, width, height, rotate } = props;
  const renderElement = (
    <g>
      <rect key={rect.id} {...props} className={classes} />
      <foreignObject
        fontSize={14}
        x={x}
        y={y}
        width={width}
        height={height}
        alignmentBaseline="middle"
        textAnchor="middle"
        id={rect.id}
      >
        <div
          className="textContainer"
          data-xmlns="http://www.w3.org/1999/xhtml"
        >
          <textarea
            className="textInput"
            id={rect.id}
            disabled={isEditable}
            value={text}
            onChange={onChangeInput}
          />
        </div>
      </foreignObject>
    </g>
  );
  const { tL, tR, bR, bL } = getCornerCoords(rect);
  return addDraggableCorners(
    renderElement,
    rect.id,
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

const EllipseRenderer = ({
  ellipse,
  classes,
  isSelected,
}: {
  ellipse: Ellipse;
  classes: string;
  isSelected: boolean;
}) => {
  const { type, renderingOrder, ...props } = ellipse;
  const { cx, cy, rotate, text } = props;

  const renderElement = (
    <ellipse key={ellipse.id} {...props} className={classes}>
      <text>{text}</text>
    </ellipse>
  );
  const { tL, tR, bR, bL } = getCornerCoords(ellipse);
  return addDraggableCorners(
    renderElement,
    ellipse.id,
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

const PolylineRenderer = ({
  polyline,
  classes,
}: {
  classes: string;
  polyline: Polyline;
}) => {
  const { type, renderingOrder, points, ...props } = polyline;
  const renderElement = (
    <polyline
      key={polyline.id}
      {...props}
      points={points.toString()}
      className={classes}
    ></polyline>
  );
  return renderElement;
};

export default {
  Rect: RectRenderer,
  Ellipse: EllipseRenderer,
  Polyline: PolylineRenderer,
};
