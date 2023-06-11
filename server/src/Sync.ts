import { Either, isRight } from "fp-ts/lib/Either";
import { Change, VersionVector } from "../../client/src/services/ChangeTypes";
import { copy } from "../../client/src/helpers/utility";
import { insertChanges } from "./db/queries";

type UserChanges = {
  [userId: string]: Change[];
};
export class Sync {
  userChanges: UserChanges;
  onSaveToStorage: ReturnType<typeof insertChanges>;

  constructor(
    initialChanges: UserChanges = {},
    onSaveToStorage: ReturnType<typeof insertChanges>
  ) {
    this.userChanges = initialChanges;
    this.onSaveToStorage = onSaveToStorage;
  }

  async addRemoteChange(
    changes: Change[],
    onSend: (changes: Change[]) => void
  ) {
    // Only store non ephemeral changes
    const nonEphemeralChanges = changes.filter((c) => !c.ephemeral);
    const newChanges = nonEphemeralChanges.reduce((acc, change) => {
      const userId = change.object.userVersion.userId;
      acc[userId] = userId in acc ? [...acc[userId], change] : [change];
      return acc;
    }, copy(this.userChanges));

    this.userChanges = newChanges;
    const res = await Promise.all(this.onSaveToStorage(nonEphemeralChanges));

    // Send all changes incl non ephemeral changes
    onSend(changes);
  }

  syncUser(
    clientVersionVector: VersionVector,
    onSend: (changes: Change[]) => void
  ) {
    const serverUserIds = Object.keys(this.userChanges);

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
      (acc: Change[], userId) => {
        if (mergedVector[userId].version === 0) {
          return [...acc, ...this.userChanges[userId]];
        } else {
          const missingActions = this.userChanges[userId].slice(
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
