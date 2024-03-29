import React from "react";
import { ElementType, Element, COLORS } from "../../types";
import { useAppState } from "../../context/AppState";
import { copy } from "../../helpers/utility";
import { createUpdateChangeAction } from "../../services/ChangeTypes";
import styled, { css } from "styled-components";
import { ArrowSelection, Side } from "../ArrowSelection/ArrowSelection";

const PropertiesContainer = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translate(0, -50%);
  z-index: 2;
  background-color: #f7f7f7;
  padding: 10px 20px;
  border-radius: 4px;
  color: #555555;
  display: flex;
  gap: 20px;
  flex-direction: column;
`;

const transparentStyles = `
  background-image: linear-gradient(45deg, #808080 25%, transparent 25%),
    linear-gradient(-45deg, #808080 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #808080 75%),
    linear-gradient(-45deg, transparent 75%, #808080 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
  `;

const ColorButton = styled.button<{
  isTransparent: boolean;
  isActive: boolean;
}>`
  width: 20px;
  height: 20px;
  margin-right: 6px;
  border: none;
  border-radius: 2px;
  ${(props) =>
    props.isTransparent
      ? css`
          ${transparentStyles}
        `
      : {}}
  outline: ${(props) => (props.isActive ? "3px dashed skyblue" : "")};
`;

const Property = styled.div``;

const PropertyItems = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

export const Properties = () => {
  const {
    appState,
    selectedElements: selectedElement,
    history,
  } = useAppState();
  const element =
    selectedElement.length > 0 ? appState.elements[selectedElement[0]] : null;

  const properties = (element: Element | null) => {
    if (!element) return;
    let settings;
    switch (element.type) {
      case ElementType.Ellipse:
      case ElementType.Diamond:
      case ElementType.Rect: {
        settings = (
          <>
            <Property>
              <p>Background</p>
              {Object.values(COLORS).map((color) => (
                <ColorButton
                  key={color}
                  isActive={element?.style?.fill === color}
                  isTransparent={color === "transparent"}
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
            </Property>
            <Property>
              <p>Stroke color</p>
              {Object.values(COLORS).map((color) => (
                <ColorButton
                  key={color}
                  isActive={element?.style?.stroke === color}
                  isTransparent={color === "transparent"}
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
            </Property>
            <Property>
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
            </Property>
            <Property>
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
            </Property>
            <Property>
              <p>Corners</p>
            </Property>
          </>
        );
        break;
      }
      case ElementType.Polyline: {
        settings = (
          <>
            <Property>
              <p>Stroke color</p>
              {Object.values(COLORS).map((color) => (
                <ColorButton
                  key={color}
                  isActive={element?.style?.stroke === color}
                  isTransparent={color === "transparent"}
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
            </Property>
            <Property>
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
            </Property>
            <Property>
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
            </Property>
            <Property>
              <p>Arrow heads</p>
              <PropertyItems>
                <ArrowSelection
                  onSelectArrowOption={(side, arrowOption) => {
                    const newElement = copy(element);
                    const arrowSide =
                      side === Side.left ? "leftArrow" : "rightArrow";
                    newElement[arrowSide] = arrowOption;
                    createUpdateChangeAction(newElement, false, history);
                  }}
                />
              </PropertyItems>
            </Property>
          </>
        );
        break;
      }
    }
    return settings;
  };

  const elementProperties = properties(element);
  if (!elementProperties) {
    return null;
  }
  return <PropertiesContainer>{elementProperties}</PropertiesContainer>;
};
