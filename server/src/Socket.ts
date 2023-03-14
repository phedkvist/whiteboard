import { Cursor } from "../../src/types";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { Sync } from "./Sync";
import { ChangeActions } from "../../src/services/ChangeTypes";
import { IncomingMessage } from "http";
import { isMessage } from "./Helpers";

export const toBuffer = (changeActions: ChangeActions[]) =>
  Buffer.from(JSON.stringify(changeActions));

export function onMessage(sync: Sync, ws: WebSocket, wss: WebSocketServer) {
  return function (data: RawData) {
    const parsedData = JSON.parse(data.toString());
    const message = isMessage(parsedData) ? parsedData : null;

    const sendToOthers = (data: RawData) =>
      wss.clients.forEach(function (client) {
        if (client !== ws) {
          client.send(data);
        }
      });

    if (!message) return;

    if (message.type === "cursor") {
      sendToOthers(data);
    } else if (message.type === "changes") {
      sync.addRemoteChange(message.data, (data) =>
        sendToOthers(toBuffer(data))
      );
    }

    // Parse incoming message
    // Client might want to do syncing
    // Client might want to send updates
    // Client might send ephemeral changes
  };
}

export function createConnection(sync: Sync, wss: WebSocketServer) {
  return function (ws: WebSocket, req: IncomingMessage) {
    console.log("ON CONNECTION", req.socket.remoteAddress);

    sync.syncUser({}, (changes) => ws.send(JSON.stringify(changes)));
    ws.on("message", onMessage(sync, ws, wss));
  };
}

// const sync = new Sync();
// const wss = new WebSocketServer({ port: 8080, host: "localhost" });
// wss.on("connection", createConnection(sync, wss));
