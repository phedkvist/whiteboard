import {
  Cursor,
  Element,
  ElementType,
  Ellipse,
  Polyline,
  Rect,
  Text,
} from "../types";
import { updateEllipseAction } from "./Actions/Ellipse";
import { updatePolylineAction } from "./Actions/Polyline";
import { updateRectAction } from "./Actions/Rect";
import History from "./History";

export enum ChangeType {
  Create = "create",
  Update = "update",
  Move = "move",
  Delete = "delete",
}

export interface ChangeAction {
  // userVersion: UserVersion;
  ephemeral: boolean; // Ephemeral changes should not be stored in memory.
}

// Actions
interface Create {
  changeType: ChangeType.Create;
}

interface Update {
  changeType: ChangeType.Update;
}

interface Delete {
  changeType: ChangeType.Delete;
}

// Rect Actions
interface RectAction extends ChangeAction {
  elementType: ElementType.Rect;
  object: Rect;
}
export interface CreateRectAction extends RectAction, Create {}
export interface UpdateRectAction extends RectAction, Update {}
export interface DeleteRectAction extends RectAction, Delete {}

// Ellipse Actions
interface EllipseAction extends ChangeAction {
  elementType: ElementType.Ellipse;
  object: Ellipse;
}
export interface CreateEllipseAction extends EllipseAction, Create {}
export interface UpdateEllipseAction extends EllipseAction, Update {}
export interface DeleteEllipseAction extends EllipseAction, Delete {}

// Polyline Actions
interface PolylineAction extends ChangeAction {
  elementType: ElementType.Polyline;
  object: Polyline;
}
export interface CreatePolylineAction extends PolylineAction, Create {}
export interface UpdatePolylineAction extends PolylineAction, Update {}
export interface DeletePolylineAction extends PolylineAction, Delete {}

// Text Actions
interface TextAction extends ChangeAction {
  elementType: ElementType.Text;
  object: Text;
}
export interface CreateTextAction extends TextAction, Create {}
export interface UpdateTextAction extends TextAction, Update {}
export interface DeleteTextAction extends TextAction, Delete {}

export type ChangeActions =
  | CreateRectAction
  | UpdateRectAction
  | DeleteRectAction
  | CreateEllipseAction
  | UpdateEllipseAction
  | DeleteEllipseAction
  | CreatePolylineAction
  | UpdatePolylineAction
  | DeletePolylineAction
  | CreateTextAction
  | UpdateTextAction
  | UpdateTextAction
  | DeleteTextAction;

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
  }
};

export interface CursorEvent {
  type: "cursor";
  data: Cursor[];
}

export interface ChangeEvent {
  type: "changes";
  data: ChangeActions[];
}

export type SocketEvent = CursorEvent | ChangeEvent;
