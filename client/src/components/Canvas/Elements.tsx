import { useCallback, useEffect } from "react";
import {
  SelectionModes,
  SelectionMode,
  Element,
  Rect,
  ElementType,
  Ellipse,
  Polyline,
  Text,
  Diamond,
} from "../../types";
import { copy } from "../../helpers/utility";
import History from "../../services/History";
import React from "react";
import {
  CONNECTING_BORDER_SIZE,
  CONNECTING_BORDER_STROKE,
  CONNECTING_BORDER_OPACITY,
  CONNECTING_BORDER_STYLE,
  CORNER_OFFSET,
} from "../../constants";
import { createRoundedLine, renderSvgElement } from "./shapes";
import { createUpdateChange } from "../../services/Actions";

const getCornerCoords = (e: Element) => {
  if (
    e.type === ElementType.Rect ||
    e.type === ElementType.Text ||
    e.type === ElementType.Diamond ||
    e.type === ElementType.Ellipse
  ) {
    return {
      tL: { x: e.x, y: e.y },
      tR: { x: e.x + e.width, y: e.y },
      bR: { x: e.x + e.width, y: e.y + e.height },
      bL: { x: e.x, y: e.y + e.height },
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

const renderConnectingBorder = (e: Element) => {
  const { tL, tR, bR, bL } = getCornerCoords(e);
  switch (e.type) {
    case ElementType.Rect:
    case ElementType.Text:
      return (
        <>
          <line
            id={`${e.id}-connecting-border-top`}
            x1={tL.x}
            x2={tR.x}
            y1={tL.y - CONNECTING_BORDER_SIZE / 2}
            y2={tR.y - CONNECTING_BORDER_SIZE / 2}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
          <line
            id={`${e.id}-connecting-border-bottom`}
            x1={bL.x}
            x2={bR.x}
            y1={bL.y + CONNECTING_BORDER_SIZE / 2}
            y2={bR.y + CONNECTING_BORDER_SIZE / 2}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
          <line
            id={`${e.id}-connecting-border-right`}
            x1={tR.x + CONNECTING_BORDER_SIZE / 2}
            x2={bR.x + CONNECTING_BORDER_SIZE / 2}
            y1={tR.y - CONNECTING_BORDER_SIZE}
            y2={bR.y + CONNECTING_BORDER_SIZE}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
          <line
            id={`${e.id}-connecting-border-left`}
            x1={tL.x - CONNECTING_BORDER_SIZE / 2}
            x2={bL.x - CONNECTING_BORDER_SIZE / 2}
            y1={tL.y - CONNECTING_BORDER_SIZE}
            y2={bL.y + CONNECTING_BORDER_SIZE}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
        </>
      );
    case ElementType.Diamond: {
      const { x, y, width: w, height: h } = e;
      const cx = x + w / 2;
      const cy = y + h / 2;
      const a = [cx, cy - h / 2 - CONNECTING_BORDER_SIZE / 2];
      const b = [cx + w / 2 + CONNECTING_BORDER_SIZE / 2, cy];
      const c = [cx, cy + h / 2 + CONNECTING_BORDER_SIZE / 2];
      const d = [cx - w / 2 - CONNECTING_BORDER_SIZE / 2, cy];

      const tL = { x: a[0], y: a[1] };
      const tR = { x: b[0], y: b[1] };
      const bR = { x: c[0], y: c[1] };
      const bL = { x: d[0], y: d[1] };

      return (
        <>
          <line
            id={`${e.id}-connecting-border-top`}
            x1={tL.x}
            y1={tL.y}
            x2={tR.x}
            y2={tR.y}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
          <line
            id={`${e.id}-connecting-border-right`}
            x1={tR.x}
            y1={tR.y}
            x2={bR.x}
            y2={bR.y}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
          <line
            id={`${e.id}-connecting-border-bottom`}
            x1={bL.x}
            y1={bL.y}
            x2={bR.x}
            y2={bR.y}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
          <line
            id={`${e.id}-connecting-border-left`}
            x1={tL.x}
            y1={tL.y}
            x2={bL.x}
            y2={bL.y}
            stroke={CONNECTING_BORDER_STROKE}
            opacity={CONNECTING_BORDER_OPACITY}
            strokeWidth={CONNECTING_BORDER_SIZE}
            strokeLinecap={CONNECTING_BORDER_STYLE}
          />
        </>
      );
    }
    case ElementType.Ellipse:
      const rx = e.width / 2;
      const ry = e.height / 2;
      const cx = e.x + rx;
      const cy = e.y + ry;
      return (
        <ellipse
          rx={rx + CONNECTING_BORDER_SIZE / 2}
          ry={ry + CONNECTING_BORDER_SIZE / 2}
          cx={cx}
          cy={cy}
          fill={"none"}
          stroke={CONNECTING_BORDER_STROKE}
          opacity={CONNECTING_BORDER_OPACITY}
          strokeWidth={CONNECTING_BORDER_SIZE}
        />
      );
    default:
      return null;
  }
};

const renderCornerSelectors = (e: Element) => {
  const { tL, tR, bR, bL } = getCornerCoords(e);
  return (
    <>
      <circle
        id={`${e.id}-rotate`}
        r={5}
        cx={(tL.x + tR.x) / 2}
        cy={tL.y - 2 * CORNER_OFFSET}
        style={{ cursor: "grabbing" }}
        fill={"white"}
        stroke={"lightblue"}
        data-testid="rotate"
      />
      <rect
        id={`${e.id}-resize-top-left`}
        width={8}
        height={8}
        x={tL.x - CORNER_OFFSET}
        y={tL.y - CORNER_OFFSET}
        style={{ cursor: "nwse-resize" }}
        fill={"white"}
        stroke={"lightblue"}
      />
      <rect
        id={`${e.id}-resize-top-right`}
        width={8}
        height={8}
        x={tR.x}
        y={tR.y - CORNER_OFFSET}
        style={{ cursor: "nesw-resize" }}
        fill={"white"}
        stroke={"lightblue"}
      />
      <rect
        id={`${e.id}-resize-bottom-right`}
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
        id={`${e.id}-resize-bottom-left`}
        width={8}
        height={8}
        x={bL.x - CORNER_OFFSET}
        y={bL.y}
        style={{ cursor: "nesw-resize" }}
        fill={"white"}
        stroke={"lightblue"}
      />
    </>
  );
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
  rotate: number,
  isSelected: boolean,
  e: Element,
  isEditingPolyline: boolean = false
) => (
  <g key={`g-${id}`} transform={`rotate(${rotate}, ${midX}, ${midY})`}>
    {renderElement}
    {isEditingPolyline && renderConnectingBorder(e)}
    {isSelected && renderCornerSelectors(e)}
  </g>
);

const EditableInput = ({
  x,
  y,
  width,
  height,
  id,
  isEnabled,
  text,
  onChange,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  isEnabled: boolean;
  text: string;
  onChange: React.FormEventHandler<HTMLTextAreaElement>;
}) => {
  const ref = React.createRef<HTMLTextAreaElement>();
  useEffect(() => {
    if (isEnabled) {
      ref.current?.focus();
    }
  }, [isEnabled, ref]);

  const updateHeight = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "1px";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [ref]);

  const onKeyUp = () => {
    updateHeight();
  };

  useEffect(() => {
    updateHeight();
  }, [text, updateHeight]);

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
        <textarea
          className="textInput"
          data-testid="editableInput"
          ref={ref}
          id={id}
          disabled={!isEnabled}
          onInput={onChange}
          onKeyUp={onKeyUp}
          suppressContentEditableWarning
          value={text}
        />
      </div>
    </foreignObject>
  );
};

const SquareRenderer = ({
  isSelected,
  selectionMode,
  classes,
  element,
  history,
  isEditingPolyline,
}: {
  isSelected: boolean;
  selectionMode: SelectionMode;
  classes: string;
  element: Rect | Text | Diamond | Ellipse;
  history: History | null;
  isEditingPolyline: boolean;
}) => {
  const onChangeInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
    const elementCopy = copy(element);
    if (elementCopy && history) {
      const changeAction = createUpdateChange(
        { ...elementCopy, text: e.currentTarget.value },
        false,
        history?.currentUserId
      );
      changeAction && history.addLocalChange(changeAction);
    }
  };

  const isEnabled =
    isSelected && selectionMode.type === SelectionModes.TextEditing;

  const { type, renderingOrder, userVersion, style, ...props } = element;
  const { x, y, width, height, rotate } = props;
  const renderElement = (
    <g>
      {renderSvgElement(element, classes)}
      <EditableInput
        x={x}
        y={y}
        width={width}
        height={height}
        id={element.id}
        isEnabled={isEnabled}
        text={element.text}
        onChange={onChangeInput}
      />
    </g>
  );
  return addDraggableCorners(
    renderElement,
    element.id,
    x + width / 2,
    y + height / 2,
    rotate,
    isSelected,
    element,
    isEditingPolyline
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
  const arrowStyle = props.style?.stroke;

  const processedPoints: [number, number][] = points.map((p) => {
    if (p.connectingElementId && p.connectingElementId in elements) {
      const e = elements[p.connectingElementId];
      switch (e.type) {
        case ElementType.Rect:
        case ElementType.Text:
        case ElementType.Diamond:
        case ElementType.Ellipse:
          return [e.x - p.connectingPointX!, e.y - p.connectingPointY!];
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
          id={`${id}-arrow`}
          key={`${id}-arrow`}
          orient="auto"
          markerWidth="3"
          markerHeight="4"
          refX="1.5"
          refY="2"
        >
          <path d="M0,0 V4 L2,2 Z" fill={arrowStyle} />
        </marker>
        <marker
          id={`${id}-arrow-reverse`}
          key={`${id}-arrow-reverse`}
          orient="auto"
          markerWidth="3"
          markerHeight="4"
          refX="0.5"
          refY="2"
        >
          <path d="M2,0 V4 L0,2 Z" fill={arrowStyle} />
        </marker>
      </defs>
      <path
        key={id}
        id={id}
        {...props}
        d={createRoundedLine(processedPoints)}
        fill={"transparent"}
        className={classes}
        markerStart={`url(#${id}-arrow-reverse)`}
        markerEnd={`url(#${id}-arrow)`}
        data-testid="polyline"
      ></path>
      {isSelected &&
        processedPoints.map(([x, y], i) => (
          <rect
            key={`${id}-resize-polyline-${i}`}
            id={`${id}-resize-polyline-${i}`}
            width={8}
            height={8}
            x={x - 4}
            y={y - 4}
            style={{ cursor: "nwse-resize" }}
            fill={"white"}
            stroke={"lightblue"}
            strokeWidth={1}
          />
        ))}
    </g>
  );
};

const defaultExports = {
  Square: SquareRenderer,
  Polyline: PolylineRenderer,
};

export default defaultExports;
