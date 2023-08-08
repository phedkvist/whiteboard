import { Cursor, Element, ElementType } from "../types";
import { updateDiamondAction } from "./Actions/Diamond";
import { updateEllipseAction } from "./Actions/Ellipse";
import { updatePolylineAction } from "./Actions/Polyline";
import { updateRectAction } from "./Actions/Rect";
import { updateTextAction } from "./Actions/Text";
import History from "./History";

export enum ChangeType {
  Create = "create",
  Update = "update",
  Move = "move",
  Delete = "delete",
}

export type Change = {
  changeId?: number;
  roomId?: string;
  createdAt: string;
  changeType: ChangeType;
  elementType: ElementType;
  object: Element;
  ephemeral: boolean;
};

export interface UserVersion {
  userId: string;
  version: number;
}

export interface VersionVector {
  [id: string]: UserVersion;
}

export const createUpdateChangeAction = (
  element: Element,
  ephemeral: boolean,
  history: History | null
) => {
  const { type } = element;
  if (type === ElementType.Ellipse) {
    return history?.addLocalChange(
      updateEllipseAction(element, ephemeral, history?.currentUserId)
    );
  } else if (type === ElementType.Polyline) {
    return history?.addLocalChange(
      updatePolylineAction(element, ephemeral, history?.currentUserId)
    );
  } else if (type === ElementType.Rect) {
    return history?.addLocalChange(
      updateRectAction(element, ephemeral, history?.currentUserId)
    );
  } else if (type === ElementType.Diamond) {
    return history?.addLocalChange(
      updateDiamondAction(element, ephemeral, history?.currentUserId)
    );
  } else if (type === ElementType.Text) {
    return history?.addLocalChange(
      updateTextAction(element, ephemeral, history?.currentUserId)
    );
  }
};

export interface CursorEvent {
  type: "cursor";
  data: Cursor[];
}

export interface ChangeEvent {
  type: "changes";
  data: Change[];
}

export type SocketEvent = CursorEvent | ChangeEvent;
