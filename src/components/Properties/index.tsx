import React from "react";
import "./Properties.css";
import { ElementType, Rect, Element } from "../../Types";
import { useAppState } from "../../context/AppState";

enum COLORS {
  transparent = "transparent",
  white = "#ffffff",
  black = "#000000",
  gray = "#D3D3D3",
  blue = "#0087BD",
  red = "#C40233",
  yellow = "#FFD300",
  green = "#009F6B",
}

// When there is a selected element.
// Find its state and respective properties.
// Make it possible to change these properties.
// Update state whenever the element has changed.
// Different settings for different elements

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

  // const updateProperty = (value: string, onChange: (value: string, element: Rect) => Rect) => {
  //   if (!selectedElement || !element || !(element.type === 'rect')) return;
  //   const newAppState = Object.assign({}, appState);
  //   newAppState.elements[selectedElement] = onChange(
  //     value,
  //     element
  //   );
  //   setAppState(newAppState);
  // }

  const properties = (element: Element | null) => {
    if (!element) return;
    let settings;
    switch (element.type) {
      case ElementType.Ellipse:
      case ElementType.Rect: {
        settings = (
          <>
            <p>Background</p>
            {Object.values(COLORS).map((color) => (
              <button
                key={color}
                className={`color-btn ${color}`}
                // @ts-ignore
                style={
                  color === "transparent" ? {} : { backgroundColor: color }
                }
                onClick={() => {
                  if (!selectedElement) return;
                  const newElement = JSON.parse(JSON.stringify(element));
                  newElement.style = { ...newElement.style, fill: color };
                  const newState = { ...appState };
                  newState.elements[selectedElement] = newElement;
                  setAppState(newState);
                }}
              />
            ))}
            <p>Stroke color</p>
            {Object.values(COLORS).map((color) => (
              <button
                key={color}
                className={`color-btn ${color}`}
                // @ts-ignore
                style={
                  color === "transparent" ? {} : { backgroundColor: color }
                }
                onClick={() => {
                  if (!selectedElement) return;
                  const newElement = JSON.parse(JSON.stringify(element));
                  newElement.style = { ...newElement.style, stroke: color };
                  const newState = { ...appState };
                  newState.elements[selectedElement] = newElement;
                  setAppState(newState);
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
                const newElement = JSON.parse(JSON.stringify(element));
                newElement.style = { ...newElement.style, strokeWidth };
                const newState = { ...appState };
                newState.elements[selectedElement] = newElement;
                setAppState(newState);
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
                const newElement = JSON.parse(JSON.stringify(element));
                newElement.style = { ...newElement.style, strokeDasharray };
                const newState = { ...appState };
                newState.elements[selectedElement] = newElement;
                setAppState(newState);
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
