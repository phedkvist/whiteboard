import History from "./History";
import { It, mock, when } from "strong-mock";
import { AppState } from "../types";
import { createRectAction, updateRectAction } from "./Actions/Rect";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMemo, useState } from "react";

const createRect = createRectAction(0, 0, 1, "unique-id", "b");
const updatedRect = updateRectAction(
  createRect.object,
  false,
  createRect.object.userVersion.userId
);

const appStateStub: AppState = {
  elements: { ["unique-id"]: createRect.object },
  cursors: {},
};

const useHistoryRender = (
  ws: WebSocket,
  initialState: AppState = {
    elements: {},
    cursors: {},
  },
  userId: string = "user-id"
): [History, AppState] => {
  const [appState, setAppState] = useState<AppState>(initialState);
  const history = useMemo(
    () => new History(appState, setAppState, ws, userId),
    []
  );

  return [history, appState];
};

describe("History", () => {
  it("Should handle adding local changes to appState", async () => {
    const mockWs = mock<WebSocket>();
    when(() => mockWs.addEventListener("message", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("open", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("close", It.isAny(), false))
      .thenReturn()
      .anyTimes();

    const { result } = renderHook(() => useHistoryRender(mockWs));
    const [history, state] = result.current;

    act(() => {
      history.addLocalChange(createRect, true);
    });
    waitFor(() => {
      expect(state).toEqual(appStateStub);
    });
  });

  it("Should handle updating existing changes to appState", async () => {
    const mockWs = mock<WebSocket>();
    when(() => mockWs.addEventListener("message", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("open", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("close", It.isAny(), false))
      .thenReturn()
      .anyTimes();

    const { result } = renderHook(() => useHistoryRender(mockWs, appStateStub));
    const [history, state] = result.current;

    act(() => {
      history.addLocalChange(updatedRect, true);
    });
    waitFor(() => {
      expect(state).toEqual({
        elements: { ["unique-id"]: updatedRect.object },
        cursors: {},
      });
    });
  });

  it("Should reject updating existing changes if version is behind", async () => {
    const mockWs = mock<WebSocket>();
    when(() => mockWs.addEventListener("message", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("open", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("close", It.isAny(), false))
      .thenReturn()
      .anyTimes();

    const { result } = renderHook(() => useHistoryRender(mockWs, appStateStub));
    const [history, state] = result.current;

    act(() => {
      history.addLocalChange(
        {
          ...updatedRect,
          object: {
            ...updatedRect.object,
            userVersion: {
              version: 0,
              userId: updatedRect.object.userVersion.userId,
            },
          },
        },
        true
      );
    });
    waitFor(() => {
      expect(state).toEqual({
        elements: { ["unique-id"]: createRect.object },
        cursors: {},
      });
    });
  });

  it("Should updating concurrent change if user id is lexicographically higher", async () => {
    const mockWs = mock<WebSocket>();
    when(() => mockWs.addEventListener("message", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("open", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("close", It.isAny(), false))
      .thenReturn()
      .anyTimes();

    const { result } = renderHook(() => useHistoryRender(mockWs, appStateStub));
    const [history, state] = result.current;

    const concurrentObject = {
      ...updatedRect.object,
      userVersion: {
        version: 1,
        userId: "a",
      },
    };

    act(() => {
      history.addLocalChange(
        {
          ...updatedRect,
          object: concurrentObject,
        },
        true
      );
    });
    waitFor(() => {
      expect(state).toEqual({
        elements: {
          ["unique-id"]: concurrentObject,
        },
        cursors: {},
      });
    });
  });

  it("Should send a cursor to other users", async () => {
    const mockWs = mock<WebSocket>();
    when(() => mockWs.addEventListener("message", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("open", It.isAny(), false))
      .thenReturn()
      .anyTimes();
    when(() => mockWs.addEventListener("close", It.isAny(), false))
      .thenReturn()
      .anyTimes();

    when(() =>
      mockWs.send(
        '{"type":"cursor","data":[{"id":"unique-user-id","color":"#00f","position":{"x":100,"y":100},"lastUpdated":"2023-03-19T09:31:49.722Z"}]}'
      )
    )
      .thenReturn()
      .anyTimes();

    when(() => mockWs.readyState).thenReturn(WebSocket.OPEN);

    const { result } = renderHook(() =>
      useHistoryRender(mockWs, appStateStub, "unique-user-id")
    );
    const [history] = result.current;
    history.sendCursor(100, 100, "2023-03-19T09:31:49.722Z");
  });
});
