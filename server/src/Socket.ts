import { WebSocketServer, WebSocket, RawData } from "ws";
import { Sync } from "./Sync";
import { IncomingMessage } from "http";
import { isMessage } from "./Helpers";

export const toBuffer = (message: { type: string; data: any }) =>
  Buffer.from(JSON.stringify(message));

export function onMessage(sync: Sync, ws: WebSocket, wss: WebSocketServer) {
  return async function (data: RawData) {
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
      await sync.addRemoteChange(message.data, (data) =>
        sendToOthers(toBuffer({ type: "changes", data }))
      );
    }
  };
}

export function createConnection(sync: Sync, wss: WebSocketServer) {
  return function (ws: WebSocket, req: IncomingMessage) {
    console.log("ON CONNECTION", req.socket.remoteAddress);

    // THIS IS JUST TO SYNC FROM CLEAN SLATE, IF IT IS A RECONNECT, WE SHOULD HANDLE IT BETTER?
    sync.syncUser({}, (changes) =>
      ws.send(toBuffer({ type: "changes", data: changes }))
    );
    ws.on("message", onMessage(sync, ws, wss));
  };
}

// if (process.env.TEST_ENV !== "true") {
//   console.log("STARTED SERVER");
//   const sync = new Sync();
//   const wss = new WebSocketServer({ port: 8080 });
//   wss.on("connection", createConnection(sync, wss));
// } else {
//   console.log("NOT STARTING SERVER");
// }
