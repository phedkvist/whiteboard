import {
  SelectionModes,
  SelectionMode,
  ElementType,
  SelectionModeHelper,
} from "../../types";
import { useAppState } from "../../context/AppState";
import styled from "styled-components";
import {
  DiamondSvg,
  EllipseSvg,
  LineSvg,
  PointerSvg,
  RectSvg,
  TextSvg,
} from "./SvgIcons";

const Toolbar = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 2;
  background-color: #f3f2f2;
  border-radius: 4px;
  padding: 10px;
`;

const Button = styled.button<{ isActive: boolean }>`
  border: none;
  /* border-bottom: ${(props) =>
    props.isActive ? "1px solid #66bdee" : "none"}; */
  color: ${(props) => (props.isActive ? "#66bdee" : "black")};
  background-color: transparent;
  padding: 10px;
`;

const ToolbarComponent = () => {
  const { setSelectedElements, setSelectionMode, selectionMode } =
    useAppState();

  const isActiveSelect = SelectionModeHelper.isNone(selectionMode);
  const isActiveRect = SelectionModeHelper.isAddingRect(selectionMode);
  const isActiveDiamond = SelectionModeHelper.isAddingDiamond(selectionMode);
  const isActiveEllipse = SelectionModeHelper.isAddingEllipse(selectionMode);
  const isActiveText = SelectionModeHelper.isAddingText(selectionMode);
  const isActivePolyline = SelectionModeHelper.isAddingPolyline(selectionMode);

  const activeColor = "#2D9CDB";
  const inactiveColor = "#000";
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
        <PointerSvg color={isActiveSelect ? activeColor : inactiveColor} />
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
        <RectSvg color={isActiveRect ? activeColor : inactiveColor} />
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
        <DiamondSvg color={isActiveDiamond ? activeColor : inactiveColor} />
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
        <EllipseSvg color={isActiveEllipse ? activeColor : inactiveColor} />
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
        <TextSvg color={isActiveText ? activeColor : inactiveColor} />
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
        <LineSvg color={isActivePolyline ? activeColor : inactiveColor} />
      </Button>
    </Toolbar>
  );
};

export default ToolbarComponent;
