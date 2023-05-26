import { Client } from "pg";
import { Either, left, right } from "fp-ts/lib/Either";

/*
  Think of what is needed?
  
  * Users table?
  * Rooms for storing a particular room.
  * Changes table
    * All changes from a particular user, room, and session id?
    * A single user might have several sessions open at the same time.
*/

// const createUserTable = async (client: Client) => {
//   client.query(`
//     CREATE TABLE IF NOT EXISTS users (
//       username varchar(45) NOT NULL,
//       password varchar(450) NOT NULL,
//       enabled integer NOT NULL DEFAULT '1',
//       user_id integer PRIMARY_KEY
//     )
//   `);
// };

interface Room {
  name: string;
  roomId: string;
}

const createRoomsTable = async (client: Client) => {
  client.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_id UUID PRIMARY KEY,
      name varchar(450)
    )
  `);
};

export const createRoom = async (
  client: Client,
  room: Room
): Promise<Either<Error, Room>> => {
  return client
    .query(
      `
    INSERT INTO rooms VALUES ('${room.roomId}', '${room.name}');
  `
    )
    .then((test) => {
      console.log("TEST: ", test);
      return right(room);
    })
    .catch((error: Error) => {
      console.error(error.message);
      return left(error);
    });
};

const createChangesTable = async (client: Client) => {
  client.query(`
    CREATE TABLE IF NOT EXISTS changes (
      created_at timestamp not null,
      room_id UUID not null,
      data json not null
    )
  `);
};

export const initializeDatabase = async (client: Client) => {
  // await createUserTable(client);
  await createRoomsTable(client);
};
