import { mock, when } from "strong-mock";
import { createConnection, onMessage, toBuffer } from "./Socket";
import { Sync } from "./Sync";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { IncomingMessage } from "http";
import { createRectAction } from "../../src/services/Actions/Rect";

const rect = createRectAction(100, 100, 1, "unique-id-1", "1");

describe("Socket", () => {
  it("Should create a socket connection with a sync class", () => {
    const sync = new Sync();

    const mockWs = mock<WebSocket>();
    const mockWss = mock<WebSocketServer>();

    when(() => mockWss.clients).thenReturn(new Set());

    const onMessageCallback = onMessage(sync, mockWs, mockWss);
    onMessageCallback(
      Buffer.from(JSON.stringify({ type: "changes", data: [rect] }))
    );
  });
});
