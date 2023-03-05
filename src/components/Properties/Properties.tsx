import React from "react";
import "./Properties.css";
import { ElementType, Element, COLORS } from "../../types";
import { useAppState } from "../../context/AppState";
import { copy } from "../../utility";
import { createUpdateChangeAction } from "../../services/ChangeTypes";

// When there is a selected element.
// Find its state and respective properties.
// Make it possible to change these properties.
// Update state whenever the element has changed.
// Different settings for different elements

export const Properties = () => {
  const {
    appState,
    selectedElements: selectedElement,
    history,
  } = useAppState();
  const element =
    selectedElement.length > 0
      ? appState.elements[selectedElement[0]]?.element
      : null;

  const properties = (element: Element | null) => {
    if (!element) return;
    let settings;
    switch (element.type) {
      case ElementType.Polyline:
      case ElementType.Ellipse:
      case ElementType.Rect: {
        settings = (
          <>
            <p>Background</p>
            {Object.values(COLORS).map((color) => (
              <button
                key={color}
                className={`color-btn ${
                  color === "transparent" ? "transparent" : ""
                } ${element?.style?.fill === color ? "active" : ""}`}
                // @ts-ignore
                style={
                  color === "transparent" ? {} : { backgroundColor: color }
                }
                onClick={() => {
                  if (!selectedElement) return;
                  const newElement = copy(element);
                  newElement.style = { ...newElement.style, fill: color };
                  createUpdateChangeAction(newElement, false, history);
                }}
              />
            ))}
            <p>Stroke color</p>
            {Object.values(COLORS).map((color) => (
              <button
                key={color}
                className={`color-btn ${
                  color === "transparent" ? "transparent" : ""
                } ${element?.style?.stroke === color ? "active" : ""}`}
                // @ts-ignore
                style={
                  color === "transparent" ? {} : { backgroundColor: color }
                }
                onClick={() => {
                  if (!selectedElement) return;
                  const newElement = copy(element);
                  newElement.style = { ...newElement.style, stroke: color };
                  createUpdateChangeAction(newElement, false, history);
                }}
              />
            ))}
            <p>Stroke width</p>
            <input
              key={"stroke-width"}
              type="range"
              id="stroke-width"
              name="stroke-width"
              value={element?.style?.strokeWidth}
              min="0"
              max="16"
              step={2}
              onChange={(e) => {
                const strokeWidth = Number(e.target.value);
                if (!selectedElement) return;
                const newElement = copy(element);
                newElement.style = { ...newElement.style, strokeWidth };
                createUpdateChangeAction(newElement, false, history);
              }}
            />
            <p>Stroke dasharray</p>
            <input
              key={"stroke-dasharray"}
              type="range"
              id="strok-dasharray"
              name="strok-dasharray"
              value={element?.style?.strokeDasharray}
              min="0"
              max="16"
              step={2}
              onChange={(e) => {
                const strokeDasharray = Number(e.target.value);
                if (!selectedElement) return;
                const newElement = copy(element);
                newElement.style = { ...newElement.style, strokeDasharray };
                createUpdateChangeAction(newElement, false, history);
              }}
            />
          </>
        );
      }
    }
    return settings;
  };

  return (
    <div className="properties" id="properties">
      <b>Properties {element?.type}</b>
      {properties(element)}
    </div>
  );
};
