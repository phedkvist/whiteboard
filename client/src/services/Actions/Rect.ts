import { ElementState, ElementType, Rect } from "../../types";
import {
  ChangeType,
  CreateRectAction,
  DeleteRectAction,
  UpdateRectAction,
} from "../ChangeTypes";

export const createRectAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string,
  userId: string
): CreateRectAction => {
  const rect: Rect = {
    id,
    type: ElementType.Rect,
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
    elementType: ElementType.Rect,
    object: rect,
    changeType: ChangeType.Create,
    ephemeral: false,
  };
};

export const updateRectAction = (
  object: Rect,
  ephemeral: boolean,
  userId: string
): UpdateRectAction => {
  return {
    elementType: ElementType.Rect,
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

export const deleteRectAction = (
  object: Rect,
  userId: string
): DeleteRectAction => {
  return {
    elementType: ElementType.Rect,
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
