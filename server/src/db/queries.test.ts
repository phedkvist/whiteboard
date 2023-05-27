import { Client } from "pg";
import { mock, resetAll, verifyAll, when } from "strong-mock";
import {
  getChangesByRoomId,
  getRoomById,
  insertChange,
  insertRoom,
} from "./queries";
import { Change, Room } from ".";
import { ChangeType } from "../../../client/src/services/ChangeTypes";
import { ElementType, ElementState } from "../../../client/src/types";
import { isRight } from "fp-ts/lib/Either";
import { camelToSnake } from "../Helpers";

const roomStub: Room = {
  name: "acme",
  roomId: "1234",
};

const CREATED_AT = new Date();
const changeStub: Change = {
  roomId: roomStub.roomId,
  createdAt: CREATED_AT,
  changeType: ChangeType.Create,
  elementType: ElementType.Rect,
  object: {
    id: "123",
    type: ElementType.Rect,
    text: " ",
    width: 0,
    height: 0,
    x: 100,
    y: 100,
    state: ElementState.Creation,
    rotate: 0,
    renderingOrder: 1,
    style: {
      fill: "#FDFD96",
    },
    userVersion: {
      userId: "123",
      version: 1,
    },
  },
};

const mockClient = mock<Client>();

describe("Database queries", () => {
  afterEach(() => {
    verifyAll();
  });

  beforeEach(() => {
    resetAll();
  });

  it("insertRoom should make insertion into rooms table", async () => {
    when(() =>
      mockClient.query(
        `INSERT INTO rooms VALUES ('${roomStub.roomId}', '${roomStub.name}');`
      )
    ).thenResolve({
      rows: [],
      command: "",
      rowCount: 0,
      oid: 0,
      fields: [],
    });
    await insertRoom(mockClient, roomStub);
  });

  it("getRoomById should retrieve rooms from table by roomId", async () => {
    when(() =>
      mockClient.query(
        `SELECT * FROM rooms WHERE room_id = '${roomStub.roomId}' LIMIT 1;`
      )
    ).thenResolve({
      rows: [
        {
          name: "acme",
          room_id: "1234",
        },
      ],
      command: "",
      rowCount: 0,
      oid: 0,
      fields: [],
    });
    const res = await getRoomById(mockClient, roomStub.roomId);
    expect(isRight(res) ? res.right : {}).toEqual(roomStub);
  });

  it("insertChange should insert change into changes table", async () => {
    when(() =>
      mockClient.query(
        "INSERT INTO changes (room_id, created_at, change_type, element_type, object) VALUES ('1234','" +
          CREATED_AT.toISOString() +
          '\',\'create\',\'rect\',\'{"id":"123","type":"rect","text":" ","width":0,"height":0,"x":100,"y":100,"state":"creation","rotate":0,"renderingOrder":1,"style":{"fill":"#FDFD96"},"userVersion":{"userId":"123","version":1}}\');'
      )
    ).thenResolve({
      rows: [],
      command: "",
      rowCount: 0,
      oid: 0,
      fields: [],
    });
    await insertChange(mockClient, changeStub);
  });

  it("getChangesByRoomId should get changes from changes table by roomId", async () => {
    when(() =>
      mockClient.query(
        `SELECT * FROM changes WHERE room_id = '${roomStub.roomId}' ORDER BY created_at;`
      )
    ).thenResolve({
      rows: [camelToSnake(changeStub)],
      command: "",
      rowCount: 0,
      oid: 0,
      fields: [],
    });

    const res = await getChangesByRoomId(mockClient, roomStub.roomId);
    expect(isRight(res) ? res.right : {}).toEqual([changeStub]);
  });
});
