import "./Toolbar.css";
import { SelectionMode, SelectionModes, ElementType } from "../../Types";
import { useAppState } from "../../context/AppState";
/*
Add element
- Rect, Circle, Text, Arrow
Delete element
*/

const Toolbar = () => {
  const { setSelectedElement, setSelectionMode } = useAppState();
  return (
    <div className="toolbar">
      <button
        onClick={() => {
          setSelectedElement(null);
          setSelectionMode({
            type: SelectionModes.None,
            elementType: undefined,
          });
        }}
      >
        Pointer
      </button>
      <button
        onClick={() => {
          setSelectedElement(null);

          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Rect,
          });
        }}
      >
        Rect
      </button>
      <button
        onClick={() => {
          setSelectedElement(null);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Ellipse,
          });
        }}
      >
        Circle
      </button>
      <button
        onClick={() => {
          setSelectedElement(null);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Text,
          });
        }}
      >
        Text
      </button>
    </div>
  );
};

export default Toolbar;
