import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  SetURLSearchParams,
} from "react-router-dom";
import App from "../../App";
import * as KeyCode from "keycode-js";
import {
  createRoundedDiamond,
  createRoundedLine,
  createRoundedRect,
} from "../../components/Canvas/shapes";
import { diamondStub, rectStub } from "../../stubs";

const mockGetRoomId = (
  _params: URLSearchParams,
  _setSearchParams: SetURLSearchParams
) => "1234";
export const renderWrapper = () => {
  return render(
    <MemoryRouter basename="/">
      <Routes>
        <Route path="/" element={<App getRoomId={mockGetRoomId} />} />
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

describe("MouseEvents", () => {
  const createElements = [
    ["Rect", "rect-svg"],
    ["Diamond", "diamond"],
    ["Circle", "circle-svg"],
    ["Text", "text"],
  ];
  it.each(createElements)("Should create a %s", (buttonText, elementTestId) => {
    renderWrapper();

    fireEvent.click(screen.getByText(buttonText));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    expect(screen.getByTestId(elementTestId)).toBeDefined();
  });

  const moveElements = [
    [
      "Rect",
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
      "Diamond",
      "diamond",
      createRoundedDiamond({
        ...diamondStub,
        x: 200,
        y: 200,
        height: 100,
        width: 100,
      }),
    ],
    ["Circle", "circle-svg", "-"],
  ];

  it.each(moveElements)(
    "Should move an existing %s",
    async (buttonText, elementTestId, d) => {
      renderWrapper();

      fireEvent.click(screen.getByText(buttonText));

      const canvas = screen.getByTestId("canvas");
      mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

      const element = screen.getByTestId(elementTestId);

      mouseDragEvent(element, { x: 200, y: 200 }, { x: 300, y: 300 });

      await waitFor(() => {
        if (buttonText === "Circle") {
          expect(Number(element.getAttribute("cx"))).toEqual(250);
          expect(Number(element.getAttribute("cy"))).toEqual(250);
        } else {
          expect(element.getAttribute("d")).toEqual(d);
        }
      });
    }
  );

  const addTextToElements = ["Rect", "Diamond", "Text", "Circle"];

  it.each(addTextToElements)("Should add text to %s", async (buttonText) => {
    renderWrapper();

    fireEvent.click(screen.getByText(buttonText));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    const rect = screen.getByTestId("editableInput");

    fireEvent.doubleClick(rect);
    fireEvent.change(rect, {
      target: { innerHTML: "abc" },
    });

    await waitFor(() => {
      expect(screen.getByText("abc"));
    });
  });

  const resizeElements = [
    [
      "Rect",
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
      "Diamond",
      "diamond",
      createRoundedDiamond({
        ...diamondStub,
        x: 100,
        y: 100,
        height: 200,
        width: 200,
      }),
    ],
    ["Circle", "circle-svg", "-"],
    ["Text", "text", "-"],
  ];
  it.each(resizeElements)(
    "Should resize a %s",
    async (buttonText, elementTestId, d) => {
      renderWrapper();

      fireEvent.click(screen.getByText(buttonText));

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
        if (buttonText === "Circle") {
          expect(Number(element.getAttribute("rx"))).toEqual(100);
          expect(Number(element.getAttribute("ry"))).toEqual(100);
          expect(Number(element.getAttribute("cx"))).toEqual(200);
          expect(Number(element.getAttribute("cy"))).toEqual(200);
        } else if (buttonText === "Text") {
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
    ["Rect", "rect-svg", "rotate(270, 150, 150)"],
    ["Diamond", "diamond", "rotate(270, 150, 150)"],
    ["Circle", "circle-svg", "rotate(270, 150, 150)"],
    ["Text", "text", "rotate(239, 150, 110)"],
  ];

  it.each(rotateElements)(
    "Should rotate a %s",
    async (buttonText, elementTestId, transform) => {
      renderWrapper();

      fireEvent.click(screen.getByText(buttonText));

      const canvas = screen.getByTestId("canvas");
      mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
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
    { btn: "Rect", testId: "rect-svg" },
    { btn: "Circle", testId: "circle-svg" },
    { btn: "Text", testId: "text" },
    { btn: "Line", testId: "polyline" },
    { btn: "Diamond", testId: "diamond" },
  ];
  deleteElements.forEach(({ btn, testId }) => {
    it(`Should delete a ${btn}`, async () => {
      const screen = renderWrapper();

      fireEvent.click(screen.getByText(btn));

      const canvas = screen.getByTestId("canvas");
      if (btn === "Line") {
        mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
        fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });
        clickOnElement(canvas, { x: 150, y: 150 });
      } else if (btn === "Text") {
        clickOnElement(canvas, { x: 100, y: 100 });
        clickOnElement(canvas, { x: 110, y: 110 });
      } else {
        mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
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

    fireEvent.click(screen.getByText("Line"));
    const canvas = screen.getByTestId("canvas");

    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 100 });
    fireEvent.keyDown(window, { code: KeyCode.CODE_ESCAPE });

    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();
    await waitFor(() => {
      expect(line.getAttribute("d")).toEqual(
        createRoundedLine([
          [100, 100],
          [200, 100],
        ])
      );
    });
  });

  it("Should move a line", async () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Line"));
    const canvas = screen.getByTestId("canvas");

    // two separate onclick events pretty much
    mouseDragEvent(canvas, { x: 100, y: 0 }, { x: 200, y: 0 });
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

    fireEvent.click(screen.getByText("Text"));
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
    fireEvent.click(screen.getByText("Rect"));
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
    screen.getByTestId("rect-svg");

    // create a circle
    fireEvent.click(screen.getByText("Circle"));
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
    expect(screen.getByTestId("circle-svg")).toBeDefined();

    // create a text element
    fireEvent.click(screen.getByText("Text"));
    clickOnElement(canvas, { x: 100, y: 100 });
    const text = screen.getByTestId("text");
    expect(text).toBeDefined();

    // create a line
    fireEvent.click(screen.getByText("Line"));
    clickOnElement(canvas, { x: 100, y: 100 });
    clickOnElement(canvas, { x: 200, y: 200 });
    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();

    // TODO: Check that they are selected.
  });
});
