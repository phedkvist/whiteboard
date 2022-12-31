import { ElementState, ElementType, Text } from "../../types";
import { ChangeType, CreateTextAction, UpdateTextAction } from "../ChangeTypes";

export const createTextAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string
): CreateTextAction => {
  const object: Text = {
    id,
    type: ElementType.Text,
    x: initialX,
    y: initialY,
    width: 100,
    height: 20,
    text: "Text",
    state: ElementState.Creation,
    rotate: 0,
    renderingOrder,
    style: {
      fill: "transparent",
    },
  };

  return {
    elementType: ElementType.Text,
    object,
    changeType: ChangeType.Create,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral: false,
  };
};

export const updateTextAction = (
  object: Text,
  ephemeral: boolean
): UpdateTextAction => {
  return {
    elementType: ElementType.Text,
    object,
    changeType: ChangeType.Update,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral,
  };
};

export {};
