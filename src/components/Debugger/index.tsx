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
  } = useAppState();
  const element = selectedElement && appState.elements[selectedElement];

  if (!showDebugger) {
    return null;
  }
  return (
    <div className="debugger">
      <p>
        Selected element:{" "}
        {element &&
          Object.keys(element).map((key) => (
            <p>
              {key}: <b>{(element as any)[key].toString()}</b>
            </p>
          ))}
      </p>
      <p>
        Selection mode:{" "}
        <b>
          {selectionMode.type}, {selectionMode.elementType}
        </b>
      </p>
      {Object.keys(selectionCoordinates).map((key) => (
        <p>
          {key}: <b>{(selectionCoordinates as any)[key]}</b>
        </p>
      ))}
    </div>
  );
};
