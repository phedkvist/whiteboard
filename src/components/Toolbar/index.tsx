import "./Toolbar.css";
import { SelectionMode, SelectionModes, ElementType } from "../../Types";
/*
Add element
- Rect, Circle, Text, Arrow
Delete element
*/

const Toolbar = ({
  selectionMode,
  setSelectionMode,
}: {
  selectionMode: SelectionMode;
  setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>;
}) => {
  return (
    <div className="toolbar">
      <button
        onClick={() =>
          setSelectionMode({
            type: SelectionModes.None,
            elementType: undefined,
          })
        }
      >
        Pointer
      </button>
      <button
        onClick={() =>
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Rect,
          })
        }
      >
        Rect
      </button>
      <button
        onClick={() =>
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Ellipse,
          })
        }
      >
        Circle
      </button>
      <button
        onClick={() =>
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Text,
          })
        }
      >
        Text
      </button>
    </div>
  );
};

export default Toolbar;
