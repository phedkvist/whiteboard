import styled from "styled-components";
import { ReactComponent as UndoIcon } from "../../icons/undo.svg";
import { ReactComponent as RedoIcon } from "../../icons/redo.svg";
import { useAppState } from "../../context/AppState";

const EditContainer = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
  background-color: #f3f2f22f;
  border-radius: 4px;
  border: 1px solid lightgray;
  /* height: 30px; */
`;

const Button = styled.button`
  background-color: transparent;
  padding: 10px 6px;
  border: none;
  &:first-child {
    /* border-right: 1px solid lightgray; */
  }
`;

const Edit = () => {
  const { viewBox, setViewBox } = useAppState();
  const { scale } = viewBox;
  const zoomValue = Math.round(100 + (1 - scale) * 100);

  const updateViewBox = (newScale: number) => {
    setViewBox({
      ...viewBox,
      scale: newScale,
      w: window.innerWidth * newScale,
      h: window.innerHeight * newScale,
    });
  };

  const increaseViewBox = () => updateViewBox(scale - 0.1);
  const decreaseViewBox = () => updateViewBox(scale + 0.1);

  return (
    <EditContainer id="edit">
      <Button>
        <UndoIcon />
      </Button>
      <Button>
        <RedoIcon />
      </Button>
      {zoomValue + "%"}
      <Button onClick={increaseViewBox}>{"+"}</Button>
      <Button onClick={decreaseViewBox}>{"-"}</Button>
    </EditContainer>
  );
};

export default Edit;
