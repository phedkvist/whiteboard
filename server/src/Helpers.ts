import { ChangeActions } from "../../client/src/services/ChangeTypes";
import { Cursor } from "../../client/src/types";

export interface CursorMessage {
  type: "cursor";
  data: Cursor[];
}

export interface ChangeMessage {
  type: "changes";
  data: ChangeActions[];
}

export type Message = CursorMessage | ChangeMessage;

export function isMessage(data: any): data is Message {
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

export const snakeToCamel = (obj: object) => {
  return Object.keys(obj).reduce((acc, key) => {
    return {
      ...acc,
      [strSnakeToCamel(key)]: obj[key],
    };
  }, {});
};

export const strSnakeToCamel = (str: string) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

export const camelToSnake = (obj: object) => {
  return Object.keys(obj).reduce((acc, key) => {
    return {
      ...acc,
      [strCamelToSnakeCase(key)]: obj[key],
    };
  }, {});
};

export const strCamelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
