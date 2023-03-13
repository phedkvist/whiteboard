import { ChangeActions, VersionVector } from "./../../src/services/ChangeTypes";
import { copy } from "../../src/utility";

// dependency injection so this class has no knowledge of websocket

type Changes = {
  [userId: string]: ChangeActions[];
};
export class Sync {
  changes: Changes;

  // dependency injection for sending updates to other users?
  constructor(initialChanges: Changes = {}) {
    this.changes = initialChanges;
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
  ) {
    const serverUserIds = Object.keys(this.changes);

    const mergedVector = serverUserIds.reduce((acc, userId) => {
      if (!(userId in acc)) {
        acc[userId] = {
          userId,
          version: 0,
        };
      }
      return acc;
    }, copy(clientVersionVector));

    const missingChanges = Object.keys(mergedVector).reduce(
      (acc: ChangeActions[], userId) => {
        // Get all missing changes by the user id, then send all back to user.
        if (mergedVector[userId].version === 0) {
          return [...acc, ...this.changes[userId]];
        } else {
          const missingActions = this.changes[userId].slice(
            mergedVector[userId].version
          );
          return [...acc, ...missingActions];
        }
      },
      []
    );
    onSend(missingChanges);
  }
}
