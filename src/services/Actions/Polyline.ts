import { ElementState, ElementType, Polyline } from "../../types";
import {
  ChangeType,
  CreatePolylineAction,
  UpdatePolylineAction,
} from "../ChangeTypes";

export const createPolylineAction = (
  initialX: number,
  initialY: number,
  renderingOrder: number,
  id: string,
  userId: string
): CreatePolylineAction => {
  const object: Polyline = {
    id,
    type: ElementType.Polyline,
    text: "",
    points: [initialX, initialY],
    rotate: 0,
    stroke: "black",
    state: ElementState.Creation,
    strokeWidth: "4px",
    renderingOrder,
    userVersion: {
      userId,
      version: 1,
    },
  };

  return {
    elementType: ElementType.Polyline,
    object,
    changeType: ChangeType.Create,
    ephemeral: true,
  };
};

export const updatePolylineAction = (
  object: Polyline,
  ephemeral: boolean,
  userId: string
): UpdatePolylineAction => {
  return {
    elementType: ElementType.Polyline,
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
