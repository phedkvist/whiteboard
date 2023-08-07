import { Diamond, ElementState, ElementType } from "../../types";
import { Change, ChangeType } from "../ChangeTypes";

// A diamond element is the same as a rect, except for having the element and text rotated
export const createDiamondAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string,
  userId: string
): Change => {
  const rect: Diamond = {
    id,
    type: ElementType.Diamond,
    text: " ",
    width: 0,
    height: 0,
    x: initialX,
    y: initialY,
    state: ElementState.Creation,
    rotate: 0,
    renderingOrder,
    style: {
      fill: "#FDFD96",
    },
    userVersion: {
      userId,
      version: 1,
    },
  };

  return {
    createdAt: new Date().toISOString(),
    elementType: ElementType.Diamond,
    object: rect,
    changeType: ChangeType.Create,
    ephemeral: false,
  };
};

export const updateDiamondAction = (
  object: Diamond,
  ephemeral: boolean,
  userId: string
): Change => {
  return {
    createdAt: new Date().toISOString(),
    elementType: ElementType.Diamond,
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

export const deleteDiamondAction = (
  object: Diamond,
  userId: string
): Change => {
  return {
    createdAt: new Date().toISOString(),
    elementType: ElementType.Diamond,
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
