import { ElementType, Rect } from "../Types";

enum ChangeType {
  Create = "create",
  Update = "update",
  Move = "move",
  Delete = "delete",
}

interface Change {
  userVersion: UserVersion;
}

interface CreateRect extends Change {
  elementType: ElementType.Rect;
  changeType: ChangeType.Create;
  object: Rect;
}

interface UpdateRect extends Change {
  elementType: ElementType.Rect;
  changeType: ChangeType.Update;
  object: Partial<Rect>;
}

interface MoveRect extends Change {
  elementType: ElementType.Rect;
  changeType: ChangeType.Move;
  object: Partial<Rect>;
  ephemeral: boolean; // Ephemeral changes should not be stored in memory.
}

interface DeleteRect extends Change {
  elementType: ElementType.Rect;
  changeType: ChangeType.Delete;
  id: string;
}

type ChangeActions = CreateRect | UpdateRect | MoveRect | DeleteRect;

interface UserVersion {
  userId: string;
  clock: number;
}

interface VersionVector {
  [id: string]: UserVersion;
}

export class History {
  changes: ChangeActions[];
  redoStack: ChangeActions[];
  undoStack: ChangeActions[];
  currentUserId: string;
  versionVector: VersionVector;

  constructor() {
    this.changes = [];
    this.redoStack = [];
    this.undoStack = [];
    this.currentUserId = "random-string"; // TODO: Add uuid's
    this.versionVector = {};
  }
}
