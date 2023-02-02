import { AppState } from "../types";
import { ChangeAction, ChangeActions, VersionVector } from "./ChangeTypes";

/*
💭 Strategy: Replace all setAppState with something that creates change actions instead.
Then let those change that underlying state.


*/

function isChangeAction(action: any): action is ChangeActions {
  // TODO: Add more checks here.
  return typeof action.changeType === "string";
}

export default class History {
  changes: ChangeActions[];
  redoStack: ChangeActions[];
  undoStack: ChangeActions[];
  currentUserId: string;
  versionVector: VersionVector;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;

  constructor(
    appState: AppState,
    setAppState: React.Dispatch<React.SetStateAction<AppState>>
  ) {
    this.changes = [];
    this.redoStack = [];
    this.undoStack = [];
    this.currentUserId = "random-string"; // TODO: Add uuid's
    this.versionVector = {};
    this.appState = appState;
    this.setAppState = setAppState;
    this.loadLocalHistory();
  }

  loadLocalHistory() {
    try {
      const localHistory = JSON.parse(localStorage.getItem("history") || "");
      const newAppState = Object.assign({}, this.appState);
      const renderingOrder = [...newAppState.renderingOrder];
      let elementsCount = 0; // this is likely incorrect

      if (localHistory && Array.isArray(localHistory)) {
        const actions = localHistory.filter(isChangeAction);
        actions.forEach((change) => {
          const { object } = change;
          newAppState.elements[object.id] = object;
          renderingOrder.push(object.id);
          this.changes.push(change);
          elementsCount = change.object.renderingOrder;
        });
      }
      this.setAppState({ ...newAppState, elementsCount, renderingOrder });
    } catch (e) {
      console.log("Error loading local history");
    }
  }

  addLocalChange(change: ChangeActions, skipSave: boolean = false) {
    // Add local change and submits it to the server.
    // Add corresponding changes to the undoStack.
    // If we have disconnected, then try submitting later
    const newAppState = Object.assign({}, this.appState);

    const { object } = change;

    // TODO: Before applying, check that this version is the "most recent" using versions.
    newAppState.elements[object.id] = object;
    const elementsCount = object.renderingOrder;
    const renderingOrder = [...newAppState.renderingOrder, object.id];

    if (!change.ephemeral && !skipSave) {
      this.changes.push(change);
      localStorage.setItem("history", JSON.stringify(this.changes));
    }
    this.setAppState({ ...newAppState, elementsCount, renderingOrder });
  }

  addRemoteChange(change: ChangeAction) {
    // Add change without submitting to server
  }

  addChange() {
    // Include change to appState.
    // Creating a new change, just set the id to the element. Don't need to do anything more.
    // Moving a change, just replace the existing element and that should be fine. Given that the "version is good".
    // Updating is the same thing? Perhaps we can also remove it.
    // Delete immediately, since that change takes precedence over the other changes.
  }
}
