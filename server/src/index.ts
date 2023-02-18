import { Cursor } from "./../../src/types";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { Sync } from "./Sync";
import { ChangeActions } from "../../src/services/ChangeTypes";

const wss = new WebSocketServer({ port: 8080, host: "localhost" });

/*
  Need to keep track of all changes coming in from clients.
  Store version vectors of each client.
  Be able to sync if any user has missed any previous updates.

  */
interface CursorMessage {
  type: "cursor";
  data: Cursor[];
}

interface ChangeMessage {
  type: "changes";
  data: ChangeActions[];
}

type Message = CursorMessage | ChangeMessage;

function isMessage(data: any): data is Message {
  if (
    data.type === "cursor" &&
    Array.isArray(data.data) &&
    data.data.length > 0
  ) {
    const c = data.data[0] as Cursor;
    return (
      typeof c.color === "string" &&
      typeof c.id === "string" &&
      typeof c.position.x === "number" &&
      typeof c.position.y === "number"
    );
  }

  if (
    data.type === "changes" &&
    Array.isArray(data.data) &&
    data.data.length > 0
  ) {
    const c = data.data[0] as ChangeActions;
    return typeof c.changeType === "string" && typeof c.ephemeral === "boolean";
  }

  console.error("Unknown message: ", data);
  return false;
}

const toBuffer = (changeActions: ChangeActions[]) =>
  Buffer.from(JSON.stringify(changeActions));

const sync = new Sync();

wss.on("connection", function connection(ws: WebSocket, req) {
  console.log("ON CONNECTION", req.socket.remoteAddress);

  sync.syncUser({}, (changes) => ws.send(JSON.stringify(changes)));

  ws.on("message", function message(data) {
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
  });

  // ws.send("something");
});
