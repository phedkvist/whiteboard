import { CursorEvent } from "./services/ChangeTypes";
import { Cursor } from "./types";

export const cursorStub: Cursor = {
  id: "unique-id",
  username: "John Doe",
  position: {
    x: 0,
    y: 0,
  },
  lastUpdated: "2023-03-19T09:31:49.722Z",
  color: "red",
};
export const cursorEventStub: CursorEvent = {
  type: "cursor",
  data: [cursorStub],
};

export const eventStub: MessageEvent = {
  data: {
    text: () => JSON.stringify(cursorEventStub),
  },
  lastEventId: "",
  origin: "",
  ports: [],
  source: null,
  initMessageEvent: function (
    type: string,
    bubbles?: boolean | undefined,
    cancelable?: boolean | undefined,
    data?: any,
    origin?: string | undefined,
    lastEventId?: string | undefined,
    source?: MessageEventSource | null | undefined,
    ports?: MessagePort[] | undefined
  ): void {
    throw new Error("Function not implemented.");
  },
  bubbles: false,
  cancelBubble: false,
  cancelable: false,
  composed: false,
  currentTarget: null,
  defaultPrevented: false,
  eventPhase: 0,
  isTrusted: false,
  returnValue: false,
  srcElement: null,
  target: null,
  timeStamp: 0,
  type: "",
  composedPath: function (): EventTarget[] {
    throw new Error("Function not implemented.");
  },
  initEvent: function (
    type: string,
    bubbles?: boolean | undefined,
    cancelable?: boolean | undefined
  ): void {
    throw new Error("Function not implemented.");
  },
  preventDefault: function (): void {
    throw new Error("Function not implemented.");
  },
  stopImmediatePropagation: function (): void {
    throw new Error("Function not implemented.");
  },
  stopPropagation: function (): void {
    throw new Error("Function not implemented.");
  },
  // @ts-ignore
  AT_TARGET: 0,
  // @ts-ignore
  BUBBLING_PHASE: 0,
  // @ts-ignore
  CAPTURING_PHASE: 0,
  NONE: 0,
};
