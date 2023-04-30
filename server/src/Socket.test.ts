import { mock, when } from "strong-mock";
import { onMessage } from "./Socket";
import { Sync } from "./Sync";
import { WebSocketServer, WebSocket } from "ws";
import { createRectAction } from "../../src/services/Actions/Rect";
import { Cursor } from "../../src/types";

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
  it("Should send change actions to other clients", () => {
    const sync = new Sync();

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

    const onMessageCallback = onMessage(sync, mockWs, mockWss);
    onMessageCallback(
      Buffer.from(JSON.stringify({ type: "changes", data: [rect] }))
    );
  });

  it("Should send cursor events to other clients", () => {
    const bufferValue = Buffer.from(
      JSON.stringify({ type: "cursor", data: [cursor] })
    );
    const sync = new Sync();

    const mockWs = mock<WebSocket>();
    const mockWss = mock<WebSocketServer>();

    const mockWsReceiver = mock<WebSocket>();
    when(() => mockWsReceiver.send(bufferValue)).thenReturn();

    const clients = new Set<WebSocket>();
    clients.add(mockWsReceiver);
    clients.add(mockWs);

    when(() => mockWss.clients).thenReturn(clients);

    const onMessageCallback = onMessage(sync, mockWs, mockWss);
    onMessageCallback(bufferValue);
  });
});
