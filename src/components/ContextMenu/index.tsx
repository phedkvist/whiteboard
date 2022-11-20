import { useAppState } from "../../context/AppState";
import useContextMenu from "../../hooks/useContextMenu";
import "./ContextMenu.css";
import { copy } from "../../utility";
import { createUpdateChangeAction } from "../../services/ChangeTypes";

const ContextMenu = () => {
  const { anchorPoint, show } = useContextMenu();
  const { selectedElement, appState, history } = useAppState();

  // re-order the elements by adding or removing from the renderingOrder number,
  // in case of equal elements, the tie-braker is the id of the element.
  // bring to top brings it to the new highest renderingOrder
  // bring to bottom brings it to the new lowest renderingOrder
  // at some point this needs to be stored as an operation

  const changeRenderingOrder = (change: number) => {
    if (!selectedElement) {
      console.warn("No selected element on bring up callback");
      return;
    }
    const element = copy(appState.elements[selectedElement]);
    if (!element) {
      throw new Error(
        "No element with id in selectedElement, on bring up callback"
      );
    }
    const renderingOrder = element.renderingOrder + change;
    createUpdateChangeAction({ ...element, renderingOrder }, false, history);
  };

  const onBringUp = () => changeRenderingOrder(+1);
  const onBringDown = () => changeRenderingOrder(-1);

  const style = selectedElement ? "menu_item" : "menu_item shade";

  if (show) {
    return (
      <ul className="menu" style={{ top: anchorPoint.y, left: anchorPoint.x }}>
        <li className={style}>Copy</li>
        <li className={style} onClick={onBringUp}>
          Bring up
        </li>
        <li className={style} onClick={onBringDown}>
          Bring down
        </li>
        <hr />
        <li className={style}>Delete</li>
      </ul>
    );
  }
  return null;
};

export default ContextMenu;
