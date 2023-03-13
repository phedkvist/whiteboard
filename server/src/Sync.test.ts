import { createRectAction } from "./../../src/services/Actions/Rect";
import { ChangeActions, VersionVector } from "./../../src/services/ChangeTypes";
import { Sync } from "./Sync";
import { mock, verify, when } from "strong-mock";

const rect = createRectAction(100, 100, 1, "unique-id-1", "1");

describe("Sync", () => {
  it("Should sync missing changes from a user", () => {
    const mockOnSend = mock<(changes: ChangeActions[]) => void>();
    const changesStub: ChangeActions[] = [rect];
    const sync = new Sync();
    when(() => mockOnSend([rect])).thenReturn(undefined);

    sync.addRemoteChange(changesStub, mockOnSend);

    verify(mockOnSend);
  });
});
