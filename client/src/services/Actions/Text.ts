import { ElementState, ElementType, Text } from "../../types";
import { Change, ChangeType } from "../ChangeTypes";

export const createTextAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string,
  userId: string
): Change => {
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
    createdAt: new Date().toISOString(),
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
): Change => {
  return {
    createdAt: new Date().toISOString(),
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

export const deleteTextAction = (object: Text, userId: string): Change => {
  return {
    createdAt: new Date().toISOString(),
    elementType: ElementType.Text,
    object: {
      ...object,
      userVersion: {
        userId,
        version: object.userVersion.version + 1,
      },
    },
    changeType: ChangeType.Delete,
    ephemeral: false,
  };
};
