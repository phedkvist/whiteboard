import History from "./History";
import { It, mock, when } from "strong-mock";
import { AppState } from "../types";
import { createRectAction, updateRectAction } from "./Actions/Rect";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";

const createRect = createRectAction(0, 0, 1, "unique-id", "user-id");
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
  }
): [History, AppState] => {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [history] = useState(new History(appState, setAppState, ws));

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
});
