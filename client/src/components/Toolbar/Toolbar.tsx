import {
  SelectionModes,
  SelectionMode,
  ElementType,
  SelectionModeHelper,
} from "../../types";
import { useAppState } from "../../context/AppState";
import styled from "styled-components";

const Toolbar = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 2;
  background-color: #f3f2f2;
  border-radius: 4px;
  border: 1px solid lightgray;
  padding: 10px;
`;

const Button = styled.button<{ isActive: boolean }>`
  border: none;
  border-bottom: ${(props) => (props.isActive ? "1px solid #66bdee" : "none")};
  color: ${(props) => (props.isActive ? "#66bdee" : "black")};
  background-color: transparent;
  padding: 10px;
`;

const ToolbarComponent = () => {
  const { setSelectedElements, setSelectionMode, selectionMode } =
    useAppState();
  return (
    <Toolbar id="toolbar">
      <Button
        id="toolbar_select"
        isActive={SelectionModeHelper.isNone(selectionMode)}
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.None,
            elementType: undefined,
          });
        }}
      >
        Pointer
      </Button>
      <Button
        id="toolbar_rect"
        isActive={SelectionModeHelper.isAddingRect(selectionMode)}
        onClick={() => {
          setSelectedElements([]);

          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Rect,
          });
        }}
      >
        Rect
      </Button>
      <Button
        id="toolbar_diamond"
        isActive={SelectionModeHelper.isAddingDiamond(selectionMode)}
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Diamond,
          });
        }}
      >
        Diamond
      </Button>
      <Button
        id="toolbar_ellipse"
        isActive={SelectionModeHelper.isAddingEllipse(selectionMode)}
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Ellipse,
          });
        }}
      >
        Circle
      </Button>
      <Button
        id="toolbar_text"
        isActive={SelectionModeHelper.isAddingText(selectionMode)}
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Text,
          });
        }}
      >
        Text
      </Button>
      <Button
        id="toolbar_polyline"
        isActive={SelectionModeHelper.isAddingPolyline(selectionMode)}
        onClick={() => {
          setSelectedElements([]);
          setSelectionMode({
            type: SelectionModes.Add,
            elementType: ElementType.Polyline,
          });
        }}
      >
        Line
      </Button>
    </Toolbar>
  );
};

export default ToolbarComponent;
