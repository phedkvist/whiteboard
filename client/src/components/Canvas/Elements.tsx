import { useEffect, useState } from "react";
import {
  SelectionModes,
  SelectionMode,
  Element,
  Rect,
  ElementType,
  Ellipse,
  Polyline,
  Text,
} from "../../types";
import { angleBetweenPoints, copy } from "../../helpers/utility";
import { updateRectAction } from "../../services/Actions/Rect";
import History from "../../services/History";
import { updateEllipseAction } from "../../services/Actions/Ellipse";
import { updateTextAction } from "../../services/Actions/Text";
import React from "react";

const CORNER_OFFSET = 8;
export const CONNECTING_BORDER_SIZE = 16;
const CONNECTING_BORDER_STYLE = "butt";
const CONNECTING_BORDER_OPACITY = 0.1;
const CONNECTING_BORDER_STROKE = "gray";

const getCornerCoords = (e: Element) => {
  if (e.type === ElementType.Rect || e.type === ElementType.Text) {
    return {
      tL: { x: e.x, y: e.y },
      tR: { x: e.x + e.width, y: e.y },
      bR: { x: e.x + e.width, y: e.y + e.height },
      bL: { x: e.x, y: e.y + e.height },
    };
  } else if (e.type === ElementType.Ellipse) {
    return {
      tL: { x: e.cx - e.rx, y: e.cy - e.ry },
      tR: { x: e.cx + e.rx, y: e.cy - e.ry },
      bR: { x: e.cx + e.rx, y: e.cy + e.ry },
      bL: { x: e.cx - e.rx, y: e.cy + e.ry },
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

const fontFamily = `
@font-face {
  font-family: 'Kalam';
  font-style: normal;
  font-weight: 400;
  src: local('Kalam'), url('https://fonts.cdnfonts.com/s/13130/Kalam-Regular.woff') format('woff');
}
`;

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
  isSelected: boolean,
  isEditingPolyline: boolean = false
) => (
  <g key={`g-${id}`} transform={`rotate(${rotate}, ${midX}, ${midY})`}>
    {renderElement}{" "}
    {isEditingPolyline && (
      <>
        <line
          id={`${id}-connecting-border-top`}
          x1={tL.x}
          x2={tR.x}
          y1={tL.y - CONNECTING_BORDER_SIZE / 2}
          y2={tR.y - CONNECTING_BORDER_SIZE / 2}
          stroke={CONNECTING_BORDER_STROKE}
          opacity={CONNECTING_BORDER_OPACITY}
          stroke-width={CONNECTING_BORDER_SIZE}
          stroke-linecap={CONNECTING_BORDER_STYLE}
        />
        <line
          id={`${id}-connecting-border-bottom`}
          x1={bL.x}
          x2={bR.x}
          y1={bL.y + CONNECTING_BORDER_SIZE / 2}
          y2={bR.y + CONNECTING_BORDER_SIZE / 2}
          stroke={CONNECTING_BORDER_STROKE}
          opacity={CONNECTING_BORDER_OPACITY}
          stroke-width={CONNECTING_BORDER_SIZE}
          stroke-linecap={CONNECTING_BORDER_STYLE}
        />
        <line
          id={`${id}-connecting-border-right`}
          x1={tR.x + CONNECTING_BORDER_SIZE / 2}
          x2={bR.x + CONNECTING_BORDER_SIZE / 2}
          y1={tR.y - CONNECTING_BORDER_SIZE}
          y2={bR.y + CONNECTING_BORDER_SIZE}
          stroke={CONNECTING_BORDER_STROKE}
          opacity={CONNECTING_BORDER_OPACITY}
          stroke-width={CONNECTING_BORDER_SIZE}
          stroke-linecap={CONNECTING_BORDER_STYLE}
        />
        <line
          id={`${id}-connecting-border-left`}
          x1={tL.x - CONNECTING_BORDER_SIZE / 2}
          x2={bL.x - CONNECTING_BORDER_SIZE / 2}
          y1={tL.y - CONNECTING_BORDER_SIZE}
          y2={bL.y + CONNECTING_BORDER_SIZE}
          stroke={CONNECTING_BORDER_STROKE}
          opacity={CONNECTING_BORDER_OPACITY}
          stroke-width={CONNECTING_BORDER_SIZE}
          stroke-linecap={CONNECTING_BORDER_STYLE}
        />
      </>
    )}
    {isSelected && (
      <>
        <circle
          id={`${id}-rotate`}
          r={5}
          cx={(tL.x + tR.x) / 2}
          cy={tL.y - 2 * CORNER_OFFSET}
          style={{ cursor: "grabbing" }}
          fill={"white"}
          stroke={"lightblue"}
          data-testid="rotate"
        />
        <rect
          id={`${id}-resize-top-left`}
          width={8}
          height={8}
          x={tL.x - CORNER_OFFSET}
          y={tL.y - CORNER_OFFSET}
          style={{ cursor: "nwse-resize" }}
          fill={"white"}
          stroke={"lightblue"}
        />
        <rect
          id={`${id}-resize-top-right`}
          width={8}
          height={8}
          x={tR.x}
          y={tR.y - CORNER_OFFSET}
          style={{ cursor: "nesw-resize" }}
          fill={"white"}
          stroke={"lightblue"}
        />
        <rect
          id={`${id}-resize-bottom-right`}
          data-testid={"resize-bottom-right"}
          width={8}
          height={8}
          x={bR.x}
          y={bR.y}
          style={{ cursor: "nwse-resize" }}
          fill={"white"}
          stroke={"lightblue"}
        />
        <rect
          id={`${id}-resize-bottom-left`}
          width={8}
          height={8}
          x={bL.x - CORNER_OFFSET}
          y={bL.y}
          style={{ cursor: "nesw-resize" }}
          fill={"white"}
          stroke={"lightblue"}
        />
      </>
    )}
  </g>
);

const EditableInput = ({
  x,
  y,
  width,
  height,
  id,
  isEditable,
  text,
  onChange,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  isEditable: boolean;
  text: string;
  onChange: React.FormEventHandler<HTMLDivElement>;
}) => {
  return (
    <foreignObject
      fontSize={14}
      x={x}
      y={y}
      width={width}
      height={height}
      alignmentBaseline="middle"
      textAnchor="middle"
      id={id}
    >
      <div className="textContainer" data-xmlns="http://www.w3.org/1999/xhtml">
        <style dangerouslySetInnerHTML={{ __html: fontFamily }} />
        <div
          className="textInput"
          data-testid="editableInput"
          id={id}
          //disabled={isEditable}
          contentEditable={isEditable}
          onInput={onChange}
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: text }}
        />
      </div>
    </foreignObject>
  );
};

const RectRenderer = ({
  isSelected,
  selectionMode,
  classes,
  rect,
  history,
  isEditingPolyline,
}: {
  isSelected: boolean;
  selectionMode: SelectionMode;
  classes: string;
  rect: Rect;
  history: History | null;
  isEditingPolyline: boolean;
}) => {
  const [text, setText] = useState(rect.text);

  useEffect(() => {
    // Only update the state if its changed by another user.
    // Since the uncontrolled state will get messed up if the user changes alters the local state
    if (rect.text !== text && !isSelected) {
      setText(rect.text);
    }
  }, [rect, text, isSelected]);

  const onChangeInput: React.FormEventHandler<HTMLDivElement> = (e) => {
    // setText(e.currentTarget.textContent || "");

    const element = copy(rect);
    if (element && history) {
      const changeAction = updateRectAction(
        { ...element, text: e.currentTarget.innerHTML || "" },
        false,
        history?.currentUserId
      );
      // TODO: Consider using debounce here.
      history.addLocalChange(changeAction);
    }
  };

  const isEditable =
    isSelected && selectionMode.type === SelectionModes.TextEditing;
  const { type, renderingOrder, userVersion, ...props } = rect;
  const { x, y, width, height, rotate } = props;
  const renderElement = (
    <g>
      <rect
        key={rect.id}
        {...props}
        className={classes}
        data-testid="rect-svg"
      />
      <EditableInput
        x={x}
        y={y}
        width={width}
        height={height}
        id={rect.id}
        isEditable={isEditable}
        text={text}
        onChange={onChangeInput}
      />
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
    isSelected,
    isEditingPolyline
  );
};

const EllipseRenderer = ({
  ellipse,
  classes,
  isSelected,
  selectionMode,
  history,
}: {
  ellipse: Ellipse;
  classes: string;
  isSelected: boolean;
  selectionMode: SelectionMode;
  history: History | null;
}) => {
  const [text, setText] = useState(ellipse.text);

  useEffect(() => {
    // Only update the state if its changed by another user.
    // Since the uncontrolled state will get messed up if the user changes alters the local state
    if (ellipse.text !== text && !isSelected) {
      setText(ellipse.text);
    }
  }, [text, ellipse, isSelected]);

  const onChangeInput: React.FormEventHandler<HTMLDivElement> = (e) => {
    // setText(e.currentTarget.textContent || "");
    const element = copy(ellipse);
    if (element && history) {
      const changeAction = updateEllipseAction(
        { ...element, text: e.currentTarget.innerHTML || "" },
        false,
        history?.currentUserId
      );
      // TODO: Consider using debounce here.
      history.addLocalChange(changeAction);
    }
  };
  const { type, renderingOrder, userVersion, ...props } = ellipse;
  const { cx, cy, rx, ry, rotate } = props;
  const isEditable =
    isSelected && selectionMode.type === SelectionModes.TextEditing;
  const width = rx * Math.sqrt(2);
  const height = ry * Math.sqrt(2);
  const renderElement = (
    <g>
      <ellipse
        key={ellipse.id}
        {...props}
        className={classes}
        data-testid="circle-svg"
      />
      <EditableInput
        x={cx - width / 2}
        y={cy - height / 2}
        width={width}
        height={height}
        id={ellipse.id}
        isEditable={isEditable}
        text={text}
        onChange={onChangeInput}
      />
    </g>
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
  isSelected,
  elements,
}: {
  classes: string;
  polyline: Polyline;
  isSelected: boolean;
  elements: { [id: string]: Element };
}) => {
  const { type, renderingOrder, points, id, userVersion, ...props } = polyline;
  const arrowStyle = { fill: props.style?.stroke || "" };
  const rotate = angleBetweenPoints(
    points[0].x,
    points[0].y,
    points[1]?.x,
    points[1]?.y
  );

  const processedPoints = points.map((p) => {
    if (p.connectingElementId) {
      const e = elements[p.connectingElementId];
      switch (e.type) {
        case ElementType.Rect:
        case ElementType.Text:
          return [e.x - p.connectingPointX!, e.y - p.connectingPointY!];
        case ElementType.Ellipse:
          return [e.cx - p.connectingPointX!, e.cy - p.connectingPointY!];
        default:
          throw Error("Could not render polyline");
      }
    } else {
      return [p.x, p.y];
    }
  });
  return (
    <g id={`g-${id}`}>
      <defs>
        <marker
          id="arrow"
          key={`${id}-arrow`}
          orient="auto"
          markerWidth="3"
          markerHeight="4"
          refX="1.5"
          refY="2"
        >
          <path d="M0,0 V4 L2,2 Z" style={arrowStyle} />
        </marker>
        <marker
          id="arrow-reverse"
          key={`${id}-arrow-reverse`}
          orient="auto"
          markerWidth="3"
          markerHeight="4"
          refX="0.5"
          refY="2"
        >
          <path d="M2,0 V4 L0,2 Z" style={arrowStyle} />
        </marker>
      </defs>
      <polyline
        key={id}
        id={id}
        {...props}
        points={processedPoints.flat().join(" ")}
        className={classes}
        markerStart="url(#arrow-reverse)"
        markerEnd="url(#arrow)"
        data-testid="polyline"
      ></polyline>
      {isSelected && (
        <>
          {processedPoints.map(([x, y], i) => (
            <rect
              // TODO: Revise the id thing
              id={`${id}-resize-${i === 0 ? "left" : "right"}`}
              width={8}
              height={8}
              x={x - 4}
              y={y - 4}
              style={{ cursor: "nwse-resize" }}
              transform={`rotate(${rotate} ${x} ${y})`}
              fill={"white"}
              stroke={"lightblue"}
              strokeWidth={1}
            />
          ))}
        </>
      )}
    </g>
  );
};

const TextRenderer = ({
  isSelected,
  selectionMode,
  classes,
  textElement,
  history,
}: {
  isSelected: boolean;
  selectionMode: SelectionMode;
  classes: string;
  textElement: Text;
  history: History | null;
}) => {
  const [text, setText] = useState(textElement.text);

  useEffect(() => {
    // Only update the state if its changed by another user.
    // Since the uncontrolled state will get messed up if the user changes alters the local state
    if (textElement.text !== text && !isSelected) {
      setText(textElement.text);
    }
  }, [textElement, text, isSelected]);

  const onChangeInput: React.FormEventHandler<HTMLDivElement> = (e) => {
    // setText(e.currentTarget.textContent || "");
    const element = copy(textElement);
    if (element && history) {
      const changeAction = updateTextAction(
        { ...element, text: e.currentTarget.innerHTML || "" },
        false,
        history?.currentUserId
      );
      // TODO: Consider using debounce here.
      history.addLocalChange(changeAction);
    }
  };

  const isEditable =
    isSelected && selectionMode.type === SelectionModes.TextEditing;
  const { type, renderingOrder, userVersion, ...props } = textElement;
  const { x, y, width, height, rotate } = props;
  const renderElement = (
    <g>
      <rect
        key={textElement.id}
        {...props}
        className={classes}
        data-testid="text"
      />
      <EditableInput
        x={x}
        y={y}
        width={width}
        height={height}
        id={textElement.id}
        isEditable={isEditable}
        text={text}
        onChange={onChangeInput}
      />
    </g>
  );
  const { tL, tR, bR, bL } = getCornerCoords(textElement);
  return addDraggableCorners(
    renderElement,
    textElement.id,
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

const defaultExports = {
  Rect: RectRenderer,
  Ellipse: EllipseRenderer,
  Polyline: PolylineRenderer,
  Text: TextRenderer,
};

export default defaultExports;
