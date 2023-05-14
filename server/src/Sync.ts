import {
  ChangeActions,
  VersionVector,
} from "../../client/src/services/ChangeTypes";
import { copy } from "../../client/src/utility";

type Changes = {
  [userId: string]: ChangeActions[];
};
export class Sync {
  changes: Changes;

  constructor(initialChanges: Changes = {}) {
    this.changes = initialChanges;
  }

  addRemoteChange(
    changes: ChangeActions[],
    onSend: (changes: ChangeActions[]) => void
  ) {
    // Only store non ephemeral changes
    const nonEphemeralChanges = changes.filter((c) => !c.ephemeral);
    const newChanges = nonEphemeralChanges.reduce((acc, change) => {
      const userId = change.object.userVersion.userId;
      acc[userId] = userId in acc ? [...acc[userId], change] : [change];
      return acc;
    }, copy(this.changes));

    this.changes = newChanges;

    // Send all changes incl non ephemeral changes
    onSend(changes);
  }

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
