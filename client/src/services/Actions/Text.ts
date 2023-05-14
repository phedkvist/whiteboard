import { ElementState, ElementType, Text } from "../../types";
import { ChangeType, CreateTextAction, UpdateTextAction } from "../ChangeTypes";

export const createTextAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string,
  userId: string
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
    userVersion: {
      userId,
      version: 1,
    },
  };

  return {
    elementType: ElementType.Text,
    object,
    changeType: ChangeType.Create,
    ephemeral: false,
  };
};

export const updateTextAction = (
  object: Text,
  ephemeral: boolean,
  userId: string
): UpdateTextAction => {
  return {
    elementType: ElementType.Text,
    object: {
      ...object,
      userVersion: {
        userId,
        version: object.userVersion.version + 1,
      },
    },
    changeType: ChangeType.Update,
    ephemeral,
  };
};

export {};
