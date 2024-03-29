import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import App from "../../App";
import * as KeyCode from "keycode-js";
import {
  createRoundedDiamond,
  createRoundedLine,
  createRoundedRect,
} from "../../components/Canvas/shapes";
import { diamondStub, rectStub } from "../../stubs";
import { initialViewBox } from "../../types";
import { getViewBoxAfterZoom } from "./helpers";
import { useRoomId } from "../../hooks/useRoomId";
import { mock, when } from "strong-mock";

export const renderWrapper = () => {
  const useGetRoomId = mock<typeof useRoomId>();
  when(() => useGetRoomId())
    .thenReturn("1234")
    .anyTimes();
  return render(
    <MemoryRouter basename="/">
      <Routes>
        <Route path="/" element={<App useRoomId={useGetRoomId} />} />
      </Routes>
    </MemoryRouter>
  );
};

interface Pos {
  x: number;
  y: number;
}

const mouseDragEvent = (element: HTMLElement, from: Pos, to: Pos) => {
  fireEvent.mouseDown(element, {
    clientX: from.x,
    clientY: from.y,
  });
  fireEvent.mouseMove(element, {
    clientX: to.x,
    clientY: to.y,
  });
  fireEvent.mouseUp(element, {
    clientX: to.x,
    clientY: to.y,
  });
};

const clickOnElement = (element: HTMLElement, pos: Pos) =>
  mouseDragEvent(element, pos, pos);

describe("MouseEvents Elements", () => {
  const createElements = [
    ["rect-btn", "rect-svg"],
    ["diamond-btn", "diamond"],
    ["circle-btn", "circle-svg"],
    ["text-btn", "text"],
  ];
  it.each(createElements)(
    "Should create a %s",
    (buttonTestId, elementTestId) => {
      renderWrapper();

      fireEvent.click(screen.getByTestId(buttonTestId));

      const canvas = screen.getByTestId("canvas");
      mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

      expect(screen.getByTestId(elementTestId)).toBeDefined();
    }
  );

  const moveElements = [
    [
      "rect-btn",
      "rect-svg",
      createRoundedRect({
        ...rectStub,
        x: 200,
        y: 200,
        height: 100,
        width: 100,
      }),
    ],
    [
      "diamond-btn",
      "diamond",
      createRoundedDiamond({
        ...diamondStub,
        x: 200,
        y: 200,
        height: 100,
        width: 100,
      }),
    ],
    ["circle-btn", "circle-svg", "-"],
  ];

  it.each(moveElements)(
    "Should move an existing %s",
    async (buttonTestId, elementTestId, d) => {
      renderWrapper();

      fireEvent.click(screen.getByTestId(buttonTestId));

      const canvas = screen.getByTestId("canvas");
      mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

      const element = screen.getByTestId(elementTestId);

      mouseDragEvent(element, { x: 200, y: 200 }, { x: 300, y: 300 });

      await waitFor(() => {
        if (buttonTestId === "circle-btn") {
          expect(Number(element.getAttribute("cx"))).toEqual(250);
          expect(Number(element.getAttribute("cy"))).toEqual(250);
        } else {
          expect(element.getAttribute("d")).toEqual(d);
        }
      });
    }
  );

  const addTextToElements = [
    "rect-btn",
    "diamond-btn",
    "text-btn",
    "circle-btn",
  ];

  it.each(addTextToElements)("Should add text to %s", async (buttonTestId) => {
    renderWrapper();

    fireEvent.click(screen.getByTestId(buttonTestId));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    const rect = screen.getByTestId("editableInput");
    fireEvent.input(rect, {
      target: { value: "abc" },
    });

    await waitFor(() => {
      expect(screen.getByText("abc"));
    });
  });

  const resizeElements = [
    [
      "rect-btn",
      "rect-svg",
      createRoundedRect({
        ...rectStub,
        x: 100,
        y: 100,
        height: 200,
        width: 200,
      }),
    ],
    [
      "diamond-btn",
      "diamond",
      createRoundedDiamond({
        ...diamondStub,
        x: 100,
        y: 100,
        height: 200,
        width: 200,
      }),
    ],
    ["circle-btn", "circle-svg", "-"],
    ["text-btn", "text", "-"],
  ];
  it.each(resizeElements)(
    "Should resize a %s",
    async (buttonTestId, elementTestId, d) => {
      renderWrapper();

      fireEvent.click(screen.getByTestId(buttonTestId));

      const canvas = screen.getByTestId("canvas");
      mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

      const element = screen.getByTestId(elementTestId);
      clickOnElement(element, { x: 100, y: 100 });

      const resizeBtn = screen.getByTestId("resize-bottom-right");
      const gElement = resizeBtn.parentElement?.children[0];

      if (gElement) {
        // getBoundingClientRect is not part of jsdom and needs to be mocked
        gElement.getBoundingClientRect = jest.fn(() => ({
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          top: 100,
          bottom: 200,
          right: 200,
          left: 100,
          toJSON: () => {},
        }));
      }

      mouseDragEvent(resizeBtn, { x: 205, y: 205 }, { x: 300, y: 300 });

      await waitFor(() => {
        if (buttonTestId === "circle-btn") {
          expect(Number(element.getAttribute("rx"))).toEqual(100);
          expect(Number(element.getAttribute("ry"))).toEqual(100);
          expect(Number(element.getAttribute("cx"))).toEqual(200);
          expect(Number(element.getAttribute("cy"))).toEqual(200);
        } else if (buttonTestId === "text-btn") {
          expect(Number(element.getAttribute("x"))).toEqual(100);
          expect(Number(element.getAttribute("y"))).toEqual(100);
          expect(Number(element.getAttribute("width"))).toEqual(200);
          expect(Number(element.getAttribute("height"))).toEqual(200);
        } else {
          expect(element.getAttribute("d")).toEqual(d);
        }
      });
    }
  );

  const rotateElements = [
    ["rect-btn", "rect-svg", "rotate(270, 150, 150)"],
    ["diamond-btn", "diamond", "rotate(270, 150, 150)"],
    ["circle-btn", "circle-svg", "rotate(270, 150, 150)"],
    ["text-btn", "text", "rotate(263, 250, 130)"],
  ];

  it.each(rotateElements)(
    "Should rotate a %s",
    async (buttonTestId, elementTestId, transform) => {
      renderWrapper();

      fireEvent.click(screen.getByTestId(buttonTestId));

      const canvas = screen.getByTestId("canvas");
      mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
      fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });
      const rect = screen.getByTestId(elementTestId);
      clickOnElement(canvas, { x: 110, y: 110 });

      const rotation = screen.getByTestId("rotate");

      const gElement = rotation.parentElement?.children[0];

      if (gElement) {
        // getBoundingClientRect is not part of jsdom and needs to be mocked
        gElement.getBoundingClientRect = jest.fn(() => ({
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          top: 100,
          bottom: 200,
          right: 200,
          left: 100,
          toJSON: () => {},
        }));
      }
      mouseDragEvent(rotation, { x: 150, y: 84 }, { x: 84, y: 150 });

      await waitFor(() => {
        expect(
          rect.parentElement?.parentElement?.getAttribute("transform")
        ).toEqual(transform);
      });
    }
  );

  const deleteElements = [
    { btnTestId: "rect-btn", testId: "rect-svg" },
    { btnTestId: "circle-btn", testId: "circle-svg" },
    { btnTestId: "text-btn", testId: "text" },
    { btnTestId: "polyline-btn", testId: "polyline" },
    { btnTestId: "diamond-btn", testId: "diamond" },
  ];
  deleteElements.forEach(({ btnTestId, testId }) => {
    it(`Should delete a ${btnTestId}`, async () => {
      const screen = renderWrapper();

      fireEvent.click(screen.getByTestId(btnTestId));

      const canvas = screen.getByTestId("canvas");
      if (btnTestId === "polyline-btn") {
        fireEvent.mouseDown(canvas, {
          clientX: 100,
          clientY: 100,
        });
        fireEvent.mouseMove(canvas, {
          clientX: 200,
          clientY: 200,
        });
        fireEvent.mouseDown(canvas, {
          clientX: 200,
          clientY: 200,
        });
        fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });
        clickOnElement(canvas, { x: 150, y: 150 });
      } else if (btnTestId === "text-btn") {
        clickOnElement(canvas, { x: 100, y: 100 });
        fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });
        clickOnElement(canvas, { x: 110, y: 110 });
      } else {
        mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
        fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });
        clickOnElement(canvas, { x: 150, y: 150 });
      }

      expect(screen.getByTestId(testId)).toBeDefined();

      fireEvent.keyDown(window, { code: KeyCode.CODE_BACK_SPACE });
      await waitFor(async () => {
        const deletedElement = screen.queryByTestId(testId);
        expect(deletedElement).toBeNull();
      });
    });
  });

  it("Should create a line", async () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByTestId("polyline-btn"));
    const canvas = screen.getByTestId("canvas");

    fireEvent.mouseDown(canvas, {
      clientX: 100,
      clientY: 0,
    });
    fireEvent.mouseMove(canvas, {
      clientX: 200,
      clientY: 0,
    });
    fireEvent.mouseDown(canvas, {
      clientX: 200,
      clientY: 0,
    });
    fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });

    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();
    await waitFor(() => {
      expect(line.getAttribute("d")).toEqual(
        createRoundedLine([
          [100, 0],
          [200, 0],
        ])
      );
    });
  });

  it("Should move a line", async () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByTestId("polyline-btn"));
    const canvas = screen.getByTestId("canvas");

    fireEvent.mouseDown(canvas, {
      clientX: 100,
      clientY: 0,
    });
    fireEvent.mouseMove(canvas, {
      clientX: 200,
      clientY: 0,
    });
    fireEvent.mouseDown(canvas, {
      clientX: 200,
      clientY: 0,
    });

    fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });

    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();

    mouseDragEvent(line, { x: 150, y: 0 }, { x: 150, y: 100 });
    await waitFor(() => {
      expect(line.getAttribute("d")).toEqual(
        createRoundedLine([
          [100, 100],
          [200, 100],
        ])
      );
    });
  });

  it("Should move a text element", async () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByTestId("text-btn"));
    const canvas = screen.getByTestId("canvas");

    // one onclick event
    clickOnElement(canvas, { x: 100, y: 100 });

    const text = screen.getByTestId("text");
    expect(text).toBeDefined();

    mouseDragEvent(text, { x: 100, y: 100 }, { x: 200, y: 200 });
    await waitFor(() => {
      expect(Number(text.getAttribute("x"))).toEqual(200);
      expect(Number(text.getAttribute("y"))).toEqual(200);
    });
  });

  it("Should select multiple elements when holding click and dragging mouse", () => {
    const screen = renderWrapper();
    const canvas = screen.getByTestId("canvas");

    // create a rect
    fireEvent.click(screen.getByTestId("rect-btn"));
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
    screen.getByTestId("rect-svg");

    // create a circle
    fireEvent.click(screen.getByTestId("circle-btn"));
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
    expect(screen.getByTestId("circle-svg")).toBeDefined();

    // create a text element
    fireEvent.click(screen.getByTestId("text-btn"));
    clickOnElement(canvas, { x: 100, y: 100 });
    const text = screen.getByTestId("text");
    expect(text).toBeDefined();

    // create a line
    fireEvent.click(screen.getByTestId("polyline-btn"));
    fireEvent.mouseDown(canvas, {
      clientX: 100,
      clientY: 100,
    });
    fireEvent.mouseMove(canvas, {
      clientX: 200,
      clientY: 200,
    });
    fireEvent.mouseDown(canvas, {
      clientX: 200,
      clientY: 200,
    });
    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();

    // TODO: Check that they are selected.
  });
});

describe("MouseEvents wheel events", () => {
  it("Should get new viewBox when zooming out", async () => {
    const viewBox = initialViewBox(window);
    const newViewBox = getViewBoxAfterZoom(viewBox, 200, 200, 1);
    expect(newViewBox).toEqual({
      h: 806.4,
      scale: 1.05,
      w: 1075.2,
      x: -10,
      y: -10.000000000000002,
    });
  });

  it("Should get new viewBox when zooming in", () => {
    const viewBox = initialViewBox(window);
    const newViewBox = getViewBoxAfterZoom(viewBox, 200, 200, -1);
    expect(newViewBox).toEqual({
      h: 729.6,
      scale: 0.95,
      w: 972.8,
      x: 10,
      y: 10.000000000000002,
    });
  });

  it("Should zoom in when clicking zoom in button", () => {
    const screen = renderWrapper();
    const canvas = screen.getByTestId("canvas");

    fireEvent.click(screen.getByText("+"));
    expect(canvas.getAttribute("viewBox")).toEqual("0 0 921.6 691.2");
  });

  it("Should zoom out when click zoom out button", () => {
    const screen = renderWrapper();
    const canvas = screen.getByTestId("canvas");

    fireEvent.click(screen.getByText("-"));
    expect(canvas.getAttribute("viewBox")).toEqual(
      "0 0 1126.4 844.8000000000001"
    );
  });

  it("Should move viewBox when scrolling down", () => {
    const screen = renderWrapper();
    const canvas = screen.getByTestId("canvas");

    fireEvent.wheel(window, { deltaX: 10, deltaY: 10 });
    expect(canvas.getAttribute("viewBox")).toEqual("10 10 1024 768");
  });

  it("Should move viewBox when scrolling up", () => {
    const screen = renderWrapper();
    const canvas = screen.getByTestId("canvas");

    fireEvent.wheel(window, { deltaX: -10, deltaY: -10 });
    expect(canvas.getAttribute("viewBox")).toEqual("-10 -10 1024 768");
  });
});
