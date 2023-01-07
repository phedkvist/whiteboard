import "./Toolbar.css";
import { SelectionModes, ElementType } from "../../types";
import { useAppState } from "../../context/AppState";
/*
Add element
- Rect, Circle, Text, Arrow
Delete element
*/

const Toolbar = () => {
  const { setSelectedElements, setSelectionMode } = useAppState();
  return (
    <div className="toolbar" id="toolbar">
      <button
        id="toolbar_select"
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.None,
            elementType: undefined,
          });
        }}
      >
        Pointer
      </button>
      <button
        id="toolbar_rect"
        onClick={() => {
          setSelectedElements([]);

          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Rect,
          });
        }}
      >
        Rect
      </button>
      <button
        id="toolbar_ellipse"
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Ellipse,
          });
        }}
      >
        Circle
      </button>
      <button
        id="toolbar_text"
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Text,
          });
        }}
      >
        Text
      </button>
      <button
        id="toolbar_polyline"
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Polyline,
          });
        }}
      >
        Line
      </button>
    </div>
  );
};

export default Toolbar;
