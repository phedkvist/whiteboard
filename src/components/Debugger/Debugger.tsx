import React from "react";
import { SelectionCoordinates, SelectionMode } from "../../Types";
import "./Debugger.css";

export const Debugger = ({
  selectedElement,
  selectionCoordinates,
  selectionMode,
}: {
  selectedElement: string | null;
  selectionCoordinates: SelectionCoordinates;
  selectionMode: SelectionMode;
}) => {
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
