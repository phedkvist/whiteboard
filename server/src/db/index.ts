import { ElementType } from "./../../../client/src/types";
import { Client } from "pg";
import { ChangeType } from "../../../client/src/services/ChangeTypes";
import { Element } from "../../../client/src/types";
import { createChangesTable, createRoomsTable } from "./migration";

export interface Room {
  name: string;
  roomId: string;
}

export interface Change {
  changeId?: number;
  roomId: string;
  createdAt: Date;
  changeType: ChangeType;
  elementType: ElementType;
  object: Element;
}

export const initializeDatabase = async (client: Client) => {
  // await createUserTable(client);
  await createRoomsTable(client);
  await createChangesTable(client);
};
