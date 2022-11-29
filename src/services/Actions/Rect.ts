import { ElementState, ElementType, Rect } from "../../Types";
import { ChangeType, CreateRectAction, UpdateRectAction } from "../ChangeTypes";

export const createRectAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string
): CreateRectAction => {
  const rect: Rect = {
    id,
    type: ElementType.Rect,
    text: "",
    width: 0,
    height: 0,
    x: initialX,
    y: initialY,
    state: ElementState.Creation,
    rotate: 0,
    renderingOrder,
  };

  return {
    elementType: ElementType.Rect,
    object: rect,
    changeType: ChangeType.Create,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral: false,
  };
};

export const updateRectAction = (
  object: Rect,
  ephemeral: boolean
): UpdateRectAction => {
  return {
    elementType: ElementType.Rect,
    object,
    changeType: ChangeType.Update,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral,
  };
};
