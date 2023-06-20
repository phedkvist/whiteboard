import { mock, resetAll, verify, when } from "strong-mock";
import { onMessage } from "./Socket";
import { Sync } from "./Sync";
import { WebSocketServer, WebSocket } from "ws";
import { createRectAction } from "../../client/src/services/Actions/Rect";
import { Cursor } from "../../client/src/types";
import { insertChanges } from "./db/queries";
import { Either, Pointed } from "fp-ts/lib/Either";
import { Change } from "../../client/src/services/ChangeTypes";
import { right } from "fp-ts/lib/EitherT";

const rect = createRectAction(100, 100, 1, "unique-id-1", "1");
const cursor: Cursor = {
  id: "",
  username: "John Doe",
  position: {
    x: 0,
    y: 0,
  },
  lastUpdated: "",
  color: "",
};

describe("Socket", () => {
  const mockOnSave = mock<ReturnType<typeof insertChanges>>();
  afterEach(resetAll);

  it("Should send change actions to other clients", async () => {
    const sync = new Sync({}, mockOnSave);

    const mockWs = mock<WebSocket>();
    const mockWss = mock<WebSocketServer>();

    const mockWsReceiver = mock<WebSocket>();
    when(() =>
      mockWsReceiver.send(
        Buffer.from(JSON.stringify({ type: "changes", data: [rect] }))
      )
    ).thenReturn();

    const clients = new Set<WebSocket>();
    clients.add(mockWsReceiver);
    clients.add(mockWs);

    when(() => mockWss.clients).thenReturn(clients);
    const mockResponse: Promise<Either<Error, Change>>[] = [];
    when(() => mockOnSave([rect])).thenReturn(mockResponse);

    const onMessageCallback = onMessage(sync, mockWs, mockWss);
    await onMessageCallback(
      Buffer.from(JSON.stringify({ type: "changes", data: [rect] }))
    );

    verify(mockWsReceiver);
    verify(mockOnSave);
  });

  it("Should send cursor events to other clients", async () => {
    const bufferValue = Buffer.from(
      JSON.stringify({ type: "cursor", data: [cursor] })
    );
    const sync = new Sync({}, mockOnSave);

    const mockWs = mock<WebSocket>();
    const mockWss = mock<WebSocketServer>();

    const mockWsReceiver = mock<WebSocket>();
    when(() => mockWsReceiver.send(bufferValue)).thenReturn();

    const clients = new Set<WebSocket>();
    clients.add(mockWsReceiver);
    clients.add(mockWs);

    when(() => mockWss.clients).thenReturn(clients);

    const onMessageCallback = onMessage(sync, mockWs, mockWss);
    await onMessageCallback(bufferValue);

    verify(mockWsReceiver);
  });
});
