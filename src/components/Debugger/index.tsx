import React from "react";
import { useAppState } from "../../context/AppState";
import "./Debugger.css";

export const Debugger = () => {
  const { selectedElement, selectionCoordinates, selectionMode } =
    useAppState();
  return (
    <div className="debugger">
      <p>Selected element: {selectedElement}</p>
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
