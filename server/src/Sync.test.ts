import { createRectAction } from "../../client/src/services/Actions/Rect";
import { Change, VersionVector } from "../../client/src/services/ChangeTypes";
import { Sync } from "./Sync";
import { mock, resetAll, verify, when } from "strong-mock";
import { insertChanges } from "./db/queries";
import { Either } from "fp-ts/lib/Either";

const rect = createRectAction(100, 100, 1, "unique-id-1", "1");
const rect2 = createRectAction(100, 100, 2, "unique-id-2", "2");
const rect3 = createRectAction(200, 200, 3, "unique-id-3", "2");

describe("Sync", () => {
  const mockOnSave = mock<ReturnType<typeof insertChanges>>();
  const mockOnSend = mock<(changes: Change[]) => void>();

  afterEach(resetAll);

  it("Should send changes from a user to others", async () => {
    const changesStub: Change[] = [rect];
    const sync = new Sync({}, mockOnSave);
    when(() => mockOnSend([rect])).thenReturn(undefined);

    const mockResponse: Promise<Either<Error, Change>>[] = [];
    when(() => mockOnSave(changesStub)).thenReturn(mockResponse);

    await sync.addRemoteChange(changesStub, mockOnSend);

    verify(mockOnSend);
    verify(mockOnSave);
  });

  it("Should sync all changes from a version vector", () => {
    const sync = new Sync(
      {
        "1": [rect],
        "2": [rect2, rect3],
      },
      mockOnSave
    );

    when(() => mockOnSend([rect, rect2, rect3])).thenReturn(undefined);

    sync.syncUser({}, mockOnSend);
    verify(mockOnSend);
  });

  it("Should sync partial changes from version vector", () => {
    const sync = new Sync(
      {
        "1": [rect],
        "2": [rect2, rect3],
      },
      mockOnSave
    );

    when(() => mockOnSend([rect, rect3])).thenReturn(undefined);

    sync.syncUser({ "2": { userId: "2", version: 1 } }, mockOnSend);
    verify(mockOnSend);
  });
});
