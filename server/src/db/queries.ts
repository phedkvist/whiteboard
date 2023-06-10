import { Either, left, right } from "fp-ts/lib/Either";
import { Client } from "pg";
import { Room } from ".";
import { snakeToCamel } from "../Helpers";
import { Change } from "../../../client/src/services/ChangeTypes";

export const insertRoom = async (
  client: Client,
  room: Room
): Promise<Either<Error, Room>> => {
  return client
    .query(`INSERT INTO rooms VALUES ('${room.roomId}', '${room.name}');`)
    .then((test) => {
      console.log("TEST: ", test);
      return right(room);
    })
    .catch((err: Error) => {
      console.error("Failed to insert room ", room, err);
      return left(err);
    });
};

export const getRoomById = async (
  client: Client,
  roomId: string
): Promise<Either<Error, Room>> => {
  return client
    .query(`SELECT * FROM rooms WHERE room_id = '${roomId}' LIMIT 1;`)
    .then((res) => {
      const rooms = res.rows;
      if (rooms.length > 0) {
        return right(snakeToCamel(rooms[0]) as unknown as Room);
      }
      return left(new Error("Unable to find room with id: " + roomId));
    })
    .catch((err) => {
      console.error("Failed to get room by roomId: " + roomId, err);
      return left(err);
    });
};

export const insertChanges = (client: Client) => {
  return (changes: Change[]) => changes.map((c) => insertChange(client, c));
};

export const insertChange = async (
  client: Client,
  change: Change
): Promise<Either<Error, Change>> => {
  const values = [
    change.roomId,
    change.createdAt,
    change.changeType,
    change.elementType,
    JSON.stringify(change.object),
  ]
    .map((v) => `'${v}'`)
    .join(",");
  return client
    .query(
      `INSERT INTO changes (room_id, created_at, change_type, element_type, object) VALUES (${values});`
    )
    .then((test) => {
      console.log("TEST: ", test);
      return right(change);
    })
    .catch((err: Error) => {
      console.error("Failed to insert change", err);
      return left(err);
    });
};

export const getChangesByRoomId = async (
  client: Client,
  roomId: string
): Promise<Either<Error, Change[]>> => {
  return client
    .query(
      `SELECT * FROM changes WHERE room_id = '${roomId}' ORDER BY created_at;`
    )
    .then((res) => {
      const changes = res.rows;
      return right(changes.map((c) => snakeToCamel(c) as unknown as Change));
    })
    .catch((err) => {
      console.error("Failed to fetch changes by roomId: " + roomId, err);
      return left(err);
    });
};
