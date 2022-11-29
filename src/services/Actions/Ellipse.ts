import { ElementState, ElementType, Ellipse } from "../../Types";
import {
  ChangeType,
  CreateEllipseAction,
  UpdateEllipseAction,
} from "../ChangeTypes";

export const createEllipseAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string
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
  };

  return {
    elementType: ElementType.Ellipse,
    object,
    changeType: ChangeType.Create,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral: false,
  };
};

export const updateEllipseAction = (
  object: Ellipse,
  ephemeral: boolean
): UpdateEllipseAction => {
  return {
    elementType: ElementType.Ellipse,
    object,
    changeType: ChangeType.Update,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral,
  };
};
