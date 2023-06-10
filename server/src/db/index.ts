import { Client } from "pg";
import { createChangesTable, createRoomsTable } from "./migration";

export interface Room {
  name: string;
  roomId: string;
}

export const initializeDatabase = async (client: Client) => {
  // await createUserTable(client);
  await createRoomsTable(client);
  await createChangesTable(client);
};

export const createDbClient = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client
    .connect()
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Failed to connect to database: ", err));
  return client;
};
