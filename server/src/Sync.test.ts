import { createRectAction } from "../../client/src/services/Actions/Rect";
import {
  ChangeActions,
  VersionVector,
} from "../../client/src/services/ChangeTypes";
import { Sync } from "./Sync";
import { mock, verify, when } from "strong-mock";

const rect = createRectAction(100, 100, 1, "unique-id-1", "1");
const rect2 = createRectAction(100, 100, 2, "unique-id-2", "2");
const rect3 = createRectAction(200, 200, 3, "unique-id-3", "2");

describe("Sync", () => {
  it("Should send changes from a user to others", () => {
    const mockOnSend = mock<(changes: ChangeActions[]) => void>();
    const changesStub: ChangeActions[] = [rect];
    const sync = new Sync();
    when(() => mockOnSend([rect])).thenReturn(undefined);

    sync.addRemoteChange(changesStub, mockOnSend);

    verify(mockOnSend);
  });

  it("Should sync all changes from a version vector", () => {
    const mockOnSend = mock<(changes: ChangeActions[]) => void>();

    const sync = new Sync({
      "1": [rect],
      "2": [rect2, rect3],
    });

    when(() => mockOnSend([rect, rect2, rect3])).thenReturn(undefined);

    sync.syncUser({}, mockOnSend);
    verify(mockOnSend);
  });

  it("Should sync partial changes from version vector", () => {
    const mockOnSend = mock<(changes: ChangeActions[]) => void>();

    const sync = new Sync({
      "1": [rect],
      "2": [rect2, rect3],
    });

    when(() => mockOnSend([rect, rect3])).thenReturn(undefined);

    sync.syncUser({ "2": { userId: "2", version: 1 } }, mockOnSend);
    verify(mockOnSend);
  });
});
