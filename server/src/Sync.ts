import { ChangeActions, VersionVector } from "./../../src/services/ChangeTypes";
import { copy } from "../../src/utility";

// dependency injection so this class has no knowledge of websocket

export class Sync {
  changes: {
    [userId: string]: ChangeActions[];
  };

  // dependency injection for sending updates to other users?
  constructor() {
    this.changes = {};
  }

  // Add changes to local storage, dependency injection for sending updates to all other users except this client.
  addRemoteChange(
    changes: ChangeActions[],
    onSend: (changes: ChangeActions[]) => void
  ) {
    // Update version vector to latest value from a particular user.
    // only update version vector if its not an ephemeral change

    const nonEphemeralChanges = changes.filter((c) => !c.ephemeral);

    const newChanges = nonEphemeralChanges.reduce((acc, change) => {
      const userId = change.object.userVersion.userId;
      acc[userId] = userId in acc ? [...acc[userId], change] : [change];
      return acc;
    }, copy(this.changes));

    this.changes = newChanges;

    onSend(nonEphemeralChanges);
  }

  // Send client any missing changes, dependency injection for sending the change back to client?
  // Can be used both to sync whenever a user connects for the first time, or when re-connecting due going offline.
  syncUser(
    clientVersionVector: VersionVector,
    onSend: (changes: ChangeActions[]) => void
  ) {}
}
