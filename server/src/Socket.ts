import { WebSocketServer, WebSocket, RawData } from "ws";
import { Sync } from "./Sync";
import { IncomingMessage } from "http";
import { isMessage } from "./Helpers";
import * as dotenv from "dotenv";
import { initializeDatabase } from "./db";
import { Client } from "pg";
import * as E from "fp-ts/lib/Either";
import { ChangeType } from "../../client/src/services/ChangeTypes";
import { ElementState, ElementType } from "../../client/src/types";
import { getChangesByRoomId } from "./db/queries";

dotenv.config();

const createDbClient = async () => {
  // const client = new Client({
  //   connectionString: process.env.DATABASE_URL,
  // });
  // console.log(process.env.DATABASE_URL);
  // await client.connect();
  // const roomId = "e322d262-ed09-4561-b315-50b535c0be5e";
  // await initializeDatabase(client);
  // const res = await insertRoom(client, {
  //   roomId: "e322d262-ed09-4561-b315-50b535c0be5e",
  //   name: "First room",
  // });
  // const res = await getRoomById(client, "e322d262-ed09-4561-b315-50b535c0be5e");
  // const res = await insertChange(client, {
  //   roomId,
  //   createdAt: new Date(),
  //   changeType: ChangeType.Create,
  //   elementType: ElementType.Rect,
  //   object: {
  //     id: "123",
  //     type: ElementType.Rect,
  //     text: " ",
  //     width: 0,
  //     height: 0,
  //     x: 100,
  //     y: 100,
  //     state: ElementState.Creation,
  //     rotate: 0,
  //     renderingOrder: 1,
  //     style: {
  //       fill: "#FDFD96",
  //     },
  //     userVersion: {
  //       userId: "123",
  //       version: 1,
  //     },
  //   },
  // });
  // const res = await getChangesByRoomId(client, roomId);
  // if (E.isRight(res)) {
  //   const room = res.right;
  //   console.log("RES: ", room);
  // } else {
  //   const error = res.left;
  //   console.log("HANDLE ERROR");
  // }
};

createDbClient();

export const toBuffer = (message: { type: string; data: any }) =>
  Buffer.from(JSON.stringify(message));

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

if (process.env.TEST_ENV !== "true") {
  console.log("STARTED SERVER");
  const sync = new Sync();
  const wss = new WebSocketServer({ port: 8080 });
  wss.on("connection", createConnection(sync, wss));
} else {
  console.log("NOT STARTING SERVER");
}
