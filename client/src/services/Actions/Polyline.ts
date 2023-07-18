import { ElementState, ElementType, Point, Polyline } from "../../types";
import { Change, ChangeType } from "../ChangeTypes";

export const createPolylineAction = (
  point: Point,
  renderingOrder: number,
  id: string,
  userId: string
): Change => {
  const object: Polyline = {
    id,
    type: ElementType.Polyline,
    text: "",
    points: [point],
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
    createdAt: new Date().toISOString(),
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
): Change => {
  return {
    createdAt: new Date().toISOString(),
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

export const deletePolylineAction = (
  object: Polyline,
  userId: string
): Change => {
  return {
    createdAt: new Date().toISOString(),
    elementType: ElementType.Polyline,
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
