import styled from "styled-components";
import { ReactComponent as UndoIcon } from "../../icons/undo.svg";
import { ReactComponent as RedoIcon } from "../../icons/redo.svg";

const EditContainer = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 2;
  background-color: #f3f2f2;
  border-radius: 4px;
  border: 1px solid lightgray;
`;

const Button = styled.button`
  background-color: transparent;
  padding: 10px;
  border: none;
  &:first-child {
    border-right: 1px solid lightgray;
  }
`;

const Edit = () => {
  return (
    <EditContainer id="editBar">
      <Button>
        <UndoIcon />
      </Button>
      <Button>
        <RedoIcon />
      </Button>
    </EditContainer>
  );
};

export default Edit;
