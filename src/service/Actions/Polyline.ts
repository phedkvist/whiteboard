import { ElementState, ElementType, Polyline } from "../../Types";
import {
  ChangeType,
  CreatePolylineAction,
  UpdatePolylineAction,
} from "../ChangeTypes";

export const createPolylineAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string
): CreatePolylineAction => {
  const object: Polyline = {
    id,
    type: ElementType.Polyline,
    points: [initialX, initialY],
    rotate: 0,
    stroke: "black",
    state: ElementState.Creation,
    strokeWidth: "4px",
    renderingOrder,
  };

  return {
    elementType: ElementType.Polyline,
    object,
    changeType: ChangeType.Create,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral: true,
  };
};

export const updatePolylineAction = (
  object: Polyline
): UpdatePolylineAction => {
  return {
    elementType: ElementType.Polyline,
    object,
    changeType: ChangeType.Update,
    userVersion: {
      userId: "test",
      clock: 1,
    },
    ephemeral: false,
  };
};

export {};
