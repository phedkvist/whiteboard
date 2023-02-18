import { ChangeActions, VersionVector } from "./../../src/services/ChangeTypes";
import { copy } from "../../src/utility";

// dependency injection so this class has no knowledge of websocket

export class Sync {
  changes: ChangeActions[];
  versionVector: VersionVector;

  // dependency injection for sending updates to other users?
  constructor(initialChanges: [] = []) {
    this.changes = initialChanges;
    this.versionVector = {};
  }

  // Add changes to local storage, dependency injection for sending updates to all other users except this client.
  addRemoteChange(
    changes: ChangeActions[],
    onSend: (changes: ChangeActions[]) => void
  ) {
    // Update version vector to latest value from a particular user.
    // only update version vector if its not an ephemeral change

    const nonEphemeralChanges = changes.filter((c) => !c.ephemeral);
    const newVersionVector = nonEphemeralChanges.reduce((cur, change) => {
      change.object.id;
      const userId = change.userVersion.userId;
      if (userId in cur) {
        const clock = cur[change.userVersion.userId].clock + 1;
        cur[change.userVersion.userId] = { userId, clock };
      } else {
        cur[change.userVersion.userId] = { userId, clock: 1 };
      }
      return cur;
    }, copy<VersionVector>(this.versionVector));

    this.versionVector = newVersionVector;
    this.changes = this.changes.concat(nonEphemeralChanges);

    onSend(changes);
  }

  // Send client any missing changes, dependency injection for sending the change back to client?
  // Can be used both to sync whenever a user connects for the first time, or when re-connecting due going offline.
  syncUser(
    clientVersionVector: VersionVector,
    onSend: (changes: ChangeActions[]) => void
  ) {}
}
