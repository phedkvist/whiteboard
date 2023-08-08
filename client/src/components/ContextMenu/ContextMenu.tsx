import React from "react";
import { useAppState } from "../../context/AppState";
import useContextMenu from "../../hooks/useContextMenu";
import "./ContextMenu.css";
import { copy } from "../../helpers/utility";
import { createUpdateChangeAction } from "../../services/ChangeTypes";

const ContextMenu = () => {
  const { anchorPoint, show } = useContextMenu();
  const { selectedElements, appState, history } = useAppState();

  // re-order the elements by adding or removing from the renderingOrder number,
  // in case of equal elements, the tie-braker is the id of the element.
  // bring to top brings it to the new highest renderingOrder
  // bring to bottom brings it to the new lowest renderingOrder
  // at some point this needs to be stored as an operation

  const changeRenderingOrder = (change: number) => {
    selectedElements.forEach((selectedElement) => {
      const element = copy(appState.elements[selectedElement]);
      if (!element) {
        throw new Error(
          "No element with id in selectedElement, on bring up callback"
        );
      }
      const renderingOrder = element.renderingOrder + change;
      createUpdateChangeAction({ ...element, renderingOrder }, false, history);
    });
  };

  const getToTop = () => {
    const maxValue = Object.values(appState.elements).reduce(
      (current, element) => {
        if (element.renderingOrder > current) {
          return element.renderingOrder;
        } else {
          return current;
        }
      },
      0
    );
    const currentValue = appState.elements[selectedElements[0]];
    const diff = maxValue - currentValue.renderingOrder;
    console.log({ maxValue, current: currentValue.renderingOrder });

    if (diff === 0) {
      // The element is already at the top
      return 0;
    }
    return diff + 1;
  };

  const getToBottom = () => {
    const minValue = Object.values(appState.elements).reduce(
      (current, element) => {
        if (element.renderingOrder < current) {
          return element.renderingOrder;
        } else {
          return current;
        }
      },
      0
    );
    const currentValue = appState.elements[selectedElements[0]];
    const diff = currentValue.renderingOrder - minValue;
    console.log({ minValue, current: currentValue.renderingOrder, diff });
    if (diff === 0) {
      // already at the bottom
      return 0;
    }
    return diff + 1;
  };

  // TODO: If something is either at the top or bottom. Keep them at the same position.
  const onBringUp = () => changeRenderingOrder(+1);
  const onBringDown = () => changeRenderingOrder(-1);

  const onBringToTop = () => changeRenderingOrder(getToTop());
  const onBringToBottom = () => changeRenderingOrder(-getToBottom());

  const style = selectedElements.length > 0 ? "menu_item" : "menu_item shade";

  if (show) {
    return (
      <ul className="menu" style={{ top: anchorPoint.y, left: anchorPoint.x }}>
        <li className={style}>Copy</li>
        <li className={style} onClick={onBringUp}>
          Bring up
        </li>
        <li className={style} onClick={onBringToTop}>
          Bring to top
        </li>
        <li className={style} onClick={onBringDown}>
          Bring down
        </li>
        <li className={style} onClick={onBringToBottom}>
          Bring to bottom
        </li>
        <hr />
        <li className={style}>Delete</li>
      </ul>
    );
  }
  return null;
};

export default ContextMenu;
