import { Client } from "pg";

export const createRoomsTable = async (client: Client) => {
  client.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_id UUID PRIMARY KEY,
      name varchar(450)
    )
  `);
};

export const createChangesTable = async (client: Client) => {
  client.query(`
    CREATE TABLE IF NOT EXISTS changes (
      change_id serial not null primary key,
      room_id UUID not null,
      created_at timestamp not null,
      change_type varchar(45) not null,
      element_type varchar(45) not null,
      object json not null
    )
  `);
};
