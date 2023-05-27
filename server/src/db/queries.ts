import { Either, left, right } from "fp-ts/lib/Either";
import { Client } from "pg";
import { Room, Change } from ".";
import { snakeToCamel } from "../Helpers";

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
    .catch((error: Error) => {
      console.error(error.message);
      return left(error);
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
      console.error(err);
      return left(err);
    });
};

export const insertChange = async (
  client: Client,
  change: Change
): Promise<Either<Error, Change>> => {
  const values = [
    change.roomId,
    change.createdAt.toISOString(),
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
    .catch((error: Error) => {
      console.error(error);
      return left(error);
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
      console.error(err);
      return left(err);
    });
};
