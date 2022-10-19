import React from "react";
import { useAppState } from "../../context/AppState";
import "./Debugger.css";

export const Debugger = () => {
  const {
    selectedElement,
    appState,
    selectionCoordinates,
    selectionMode,
    showDebugger,
    viewBox,
  } = useAppState();
  const element = selectedElement && appState.elements[selectedElement];

  if (!showDebugger) {
    return null;
  }
  return (
    <div className="debugger" id="debugger">
      <p>Selected element: </p>
      {element &&
        Object.keys(element).map((key) => (
          <p key={key}>
            {key}:{" "}
            <b>
              {typeof (element as any)[key] !== "object" &&
                (element as any)[key].toString()}
            </b>
          </p>
        ))}
      <p>
        Selection mode:{" "}
        <b>
          {selectionMode.type}, {selectionMode.elementType}
        </b>
      </p>
      {/* {Object.keys(selectionCoordinates).map((key) => (
        <p key={key}>
          {key}: <b>{(selectionCoordinates as any)[key]}</b>
        </p>
      ))} */}
      <b>Viewbox</b>
      {Object.keys(viewBox).map((key) => (
        <p key={key}>
          {key}:{" "}
          <b>
            {typeof (viewBox as any)[key] !== "object" && (viewBox as any)[key]}
          </b>
        </p>
      ))}
    </div>
  );
};
