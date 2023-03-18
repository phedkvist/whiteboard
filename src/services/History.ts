import { AppState, Cursor } from "../types";
import { ChangeAction, ChangeActions, VersionVector } from "./ChangeTypes";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { copy, isNewerVersion } from "../utility";

function isChangeAction(action: any): action is ChangeActions {
  // TODO: Add more checks here.
  return typeof action.changeType === "string";
}

interface CursorEvent {
  type: "cursor";
  data: Cursor[];
}

interface ChangeEvent {
  type: "changes";
  data: ChangeActions[];
}

type SocketEvent = CursorEvent | ChangeEvent;

export default class History {
  changes: {
    [userId: string]: ChangeActions[];
  };
  redoStack: ChangeActions[];
  undoStack: ChangeActions[];

  currentUserId: string;
  versionVector: VersionVector;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  ws: WebSocket;

  throttledCursor: _.DebouncedFunc<any> = _.throttle(
    this.sendThrottledCursor,
    50
  );

  constructor(
    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>,
    ws: WebSocket = new WebSocket("ws://localhost:8080")
  ) {
    this.changes = {};
    this.redoStack = [];
    this.undoStack = [];

    this.currentUserId = uuidv4(); // TODO: Add uuid's
    this.versionVector = {};
    this.appState = appState;
    this.setAppState = setAppState;

    this.ws = ws;
    this.ws.addEventListener("message", this.onMessage.bind(this), false);
    this.ws.addEventListener("close", this.onClose, false);
    this.ws.addEventListener("open", this.onOpen, false);
  }

  onSend(changeActions: ChangeActions[]) {
    // Always send an array of changes
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "changes", data: changeActions }));
    } else {
      // TODO: Place in a queue?
    }
  }

  async onMessage(ev: MessageEvent) {
    // Verify that incoming message is correct ChangeActions.
    // Should always receive an array of change actions. Easiest to deal with.
    try {
      const event = JSON.parse(await ev.data.text()) as SocketEvent;

      if (event.type === "changes") {
        const changeActions = event.data;
        changeActions.forEach((change) => this.addLocalChange(change, true));
      } else if (event.type === "cursor") {
        const cursors = event.data;
        this.receiveCursors(cursors);
      }
    } catch (e) {
      console.log("Error parsing incoming change", e);
    }
  }

  onClose(this: WebSocket, ev: CloseEvent) {
    console.log("On close", ev);
  }

  onOpen(this: WebSocket, ev: Event) {
    console.log("On open", ev);
  }

  addLocalChange(change: ChangeActions, skipSending: boolean = false) {
    // Add corresponding changes to the undoStack.
    // If we have disconnected, then try submitting later
    this.setAppState((oldAppState) => {
      const appState = copy(oldAppState);
      const { object: newElement } = change;

      const prevElement = appState.elements[newElement.id];
      if (
        prevElement === undefined ||
        isNewerVersion(newElement.userVersion, prevElement.userVersion)
      ) {
        appState.elements[newElement.id] = newElement;
        if (!skipSending) {
          this.onSend([change]);
        }
      }
      return appState;
    });
  }

  addRemoteChange(changes: ChangeActions[]) {
    // Add change without submitting to server
    changes.forEach((change) => this.addLocalChange(change, true));
  }

  sendThrottledCursor(x: number, y: number) {
    const cursor: Cursor = {
      id: this.currentUserId,
      color: "#00f",
      position: {
        x,
        y,
      },
      lastUpdated: new Date().toISOString(),
    };
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "cursor",
          data: [cursor],
        })
      );
    }
  }

  sendCursor(x: number, y: number) {
    this.throttledCursor(x, y);
  }

  receiveCursors(cursors: Cursor[]) {
    const newCursors: {
      [id: string]: Cursor;
    } = cursors
      .filter(({ id }) => id !== this.currentUserId)
      .reduce(
        (state, c) => ({
          ...state,
          [c.id]: c,
        }),
        { ...this.appState.cursors }
      );
    this.setAppState({ ...this.appState, cursors: newCursors });
  }
}
