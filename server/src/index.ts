import { isRight } from "fp-ts/lib/Either";
import { getChangesByRoomId, insertChanges } from "./db/queries";
import WebSocket, { RawData, WebSocketServer } from "ws";
import { extractQueryParams, isMessage, mapToUserChanges } from "./Helpers";
import { Sync } from "./Sync";
import { createDbClient } from "./db";
import { IncomingMessage } from "http";
import { toBuffer } from "./Socket";
import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

interface ActiveRooms {
  sync: Sync;
  channels: WeakSet<WebSocket>; // Not entirely sure this is a good idea to have this as a weak set 🤔
}

const activeRooms: {
  [roomId: string]: ActiveRooms;
} = {};

export function onMessage(
  activeRoom: ActiveRooms,
  ws: WebSocket,
  wss: WebSocketServer
) {
  return function (data: RawData) {
    const parsedData = JSON.parse(data.toString());
    const message = isMessage(parsedData) ? parsedData : null;

    const sendToOthers = (data: RawData) =>
      wss.clients.forEach(function (client) {
        if (client !== ws && activeRoom.channels.has(client)) {
          client.send(data);
        }
      });

    if (!message) return;

    if (message.type === "cursor") {
      sendToOthers(data);
    } else if (message.type === "changes") {
      activeRoom.sync.addRemoteChange(message.data, (data) =>
        sendToOthers(toBuffer({ type: "changes", data }))
      );
    }
  };
}

// Handle WebSocket connection
const onConnection = (wss: WebSocketServer, client: Client) => {
  // Handle messages received from WebSocket clients
  return async function (ws: WebSocket, request: IncomingMessage) {
    const queryParams = extractQueryParams(request.url);
    const { roomId } = queryParams;
    if (roomId) {
      if (roomId in activeRooms) {
        activeRooms[roomId].channels.add(ws);
        activeRooms[roomId].sync.syncUser({}, (changes) =>
          ws.send(toBuffer({ type: "changes", data: changes }))
        );
      } else {
        const initialChangesQuery = await getChangesByRoomId(client, roomId);
        if (isRight(initialChangesQuery)) {
          const initialChanges = initialChangesQuery.right;
          const sync = new Sync(
            initialChanges.reduce(mapToUserChanges, {}),
            insertChanges(client)
          );
          const channels = new WeakSet();
          channels.add(ws);
          activeRooms[roomId] = {
            sync,
            channels,
          }; // TODO: Sync up with channel
          sync.syncUser({}, (changes) =>
            ws.send(toBuffer({ type: "changes", data: changes }))
          );
        } else {
          console.error("Failed to fetch existing changes");
          return;
        }
      }
    } else {
      console.error("No roomId was passed in as a query params");
      return;
    }

    ws.on("message", onMessage(activeRooms[roomId], ws, wss));
  };
};

const startServices = async () => {
  const client = await createDbClient();

  const wss = new WebSocket.Server({ port: 8080 });
  wss.on("connection", onConnection(wss, client));
};

if (process.env.TEST_ENV !== "true") {
  console.log("STARTING SERVICES");
  startServices();
}
