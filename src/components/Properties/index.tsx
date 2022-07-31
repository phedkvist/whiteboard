import React from "react";
import "./Properties.css";
import {
  initialState,
  SelectionCoordinates,
  SelectionModes,
  SelectionMode,
  AppState,
  ElementType,
  Rect,
  ElementState,
  Ellipse,
  Element,
  Text,
} from "../../Types";
import { useAppState } from "../../context/AppState";

// When there is a selected element.
// Find its state and respective properties.
// Make it possible to change these properties.
// Update state whenever the element has changed.
// Different settings for different elements

/*
(e) => {
      if (!selectedElement) return;
      const fill = e.target.value;
      const el = Object.assign({}, element);
      el.style = { ...el.style, fill };
      const newAppState = Object.assign({}, appState);
      newAppState.elements[selectedElement] = el;
      setAppState(newAppState);
    }
*/

export const Properties = () => {
  const { appState, setAppState, selectedElement } = useAppState();
  const element = selectedElement ? appState.elements[selectedElement] : null;

  const property = (
    value: string | number,
    id: string,
    inputType: React.HTMLInputTypeAttribute,
    onChange: (value: string, element: Rect) => Rect
  ) => {
    if (!element || element.type !== "rect") return;

    return (
      <div>
        <input
          type={inputType}
          id={id}
          name={id}
          value={value}
          onChange={(e) => {
            if (!selectedElement) return;
            const newAppState = Object.assign({}, appState);
            newAppState.elements[selectedElement] = onChange(
              e.target.value,
              element
            );
            setAppState(newAppState);
          }}
        />
        <label htmlFor={id}>{id.toUpperCase()}</label>
      </div>
    );
  };

  const properties = (element: Element | null) => {
    if (!element) return;
    let settings;
    switch (element.type) {
      case ElementType.Rect: {
        settings = (
          <>
            {property(
              element.style?.fill || "",
              "background",
              "color",
              (fill, element) => {
                const el = Object.assign({}, element);
                el.style = { ...el.style, fill };
                return el;
              }
            )}
            {property(
              element.style?.stroke || "",
              "border",
              "color",
              (stroke, element) => {
                const el = Object.assign({}, element);
                el.style = { ...el.style, stroke };
                return el;
              }
            )}
            {/* Make sure the selected element stroke doesn't interfere with actual stroke*/}
            {property(element.x, "x", "number", (x, element) => {
              const el = Object.assign({}, element);
              el.x = Number(x);
              return el;
            })}
            {property(element.y, "y", "number", (y, element) => {
              const el = Object.assign({}, element);
              el.y = Number(y);
              return el;
            })}
          </>
        );
      }
    }
    return settings;
  };

  return (
    <div className="properties">
      Properties {element?.type} {properties(element)}
    </div>
  );
};
