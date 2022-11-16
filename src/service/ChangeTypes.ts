import { ElementType, Ellipse, Polyline, Rect, Text } from "../Types";

export enum ChangeType {
  Create = "create",
  Update = "update",
  Move = "move",
  Delete = "delete",
}

export interface ChangeAction {
  userVersion: UserVersion;
  ephemeral: boolean; // Ephemeral changes should not be stored in memory.
}

// Actions
interface Create {
  changeType: ChangeType.Create;
}

interface Update {
  changeType: ChangeType.Update;
}

interface Move {
  changeType: ChangeType.Move;
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
export interface MoveRectAction extends RectAction, Move {}
export interface DeleteRectAction extends RectAction, Delete {}

// Ellipse Actions
interface EllipseAction extends ChangeAction {
  elementType: ElementType.Ellipse;
  object: Ellipse;
}
export interface CreateEllipseAction extends EllipseAction, Create {}
export interface UpdateEllipseAction extends EllipseAction, Update {}
export interface MoveEllipseAction extends EllipseAction, Move {}
export interface DeleteEllipseAction extends EllipseAction, Delete {}

// Polyline Actions
interface PolylineAction extends ChangeAction {
  elementType: ElementType.Polyline;
  object: Polyline;
}
export interface CreatePolylineAction extends PolylineAction, Create {}
export interface UpdatePolylineAction extends PolylineAction, Update {}
export interface MovePolylineAction extends PolylineAction, Move {}
export interface DeletePolylineAction extends PolylineAction, Delete {}

// Text Actions
interface TextAction extends ChangeAction {
  elementType: ElementType.Text;
  object: Text;
}
export interface CreateTextAction extends TextAction, Create {}
export interface UpdateTextAction extends TextAction, Update {}
export interface MoveTextAction extends TextAction, Move {}
export interface DeleteTextAction extends TextAction, Delete {}

export type ChangeActions =
  | CreateRectAction
  | UpdateRectAction
  | MoveRectAction
  | DeleteRectAction
  | CreateEllipseAction
  | UpdateEllipseAction
  | MoveEllipseAction
  | DeleteEllipseAction
  | CreatePolylineAction
  | UpdatePolylineAction
  | MovePolylineAction
  | DeletePolylineAction
  | CreateTextAction
  | UpdateTextAction
  | MoveTextAction
  | UpdateTextAction
  | DeleteTextAction;

export interface UserVersion {
  userId: string;
  clock: number;
}

export interface VersionVector {
  [id: string]: UserVersion;
}
