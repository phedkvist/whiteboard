import { ElementState, ElementType, Ellipse } from "../../types";
import {
  ChangeType,
  CreateEllipseAction,
  DeleteEllipseAction,
  UpdateEllipseAction,
} from "../ChangeTypes";

export const createEllipseAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string,
  userId: string
): CreateEllipseAction => {
  const object: Ellipse = {
    id,
    type: ElementType.Ellipse,
    text: "",
    rx: 0,
    ry: 0,
    cx: initialX,
    cy: initialY,
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
    elementType: ElementType.Ellipse,
    object,
    changeType: ChangeType.Create,
    ephemeral: false,
  };
};

export const updateEllipseAction = (
  object: Ellipse,
  ephemeral: boolean,
  userId: string
): UpdateEllipseAction => {
  return {
    elementType: ElementType.Ellipse,
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

export const deleteEllipseAction = (
  object: Ellipse,
  userId: string
): DeleteEllipseAction => {
  return {
    elementType: ElementType.Ellipse,
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
