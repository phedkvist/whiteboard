import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Toolbar/Toolbar";
import { AppStateProvider } from "./AppState";
import { MouseEventsProvider } from "./MouseEvents";
import userEvent from "@testing-library/user-event";

const renderWrapper = () => {
  return render(
    <AppStateProvider>
      <Toolbar />
      <MouseEventsProvider>
        <Canvas />
      </MouseEventsProvider>
    </AppStateProvider>
  );
};

const mouseDragEvent = (
  element: HTMLElement,
  from: {
    x: number;
    y: number;
  },
  to: {
    x: number;
    y: number;
  }
) => {
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

describe("MouseEvents", () => {
  it("Should create a rect", () => {
    renderWrapper();

    fireEvent.click(screen.getByText("Rect"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    screen.getByTestId("rect-svg");
  });

  it("Should move an existing rect", () => {
    renderWrapper();

    fireEvent.click(screen.getByText("Rect"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    const rect = screen.getByTestId("rect-svg");

    mouseDragEvent(rect, { x: 200, y: 200 }, { x: 300, y: 300 });

    expect(Number(rect.getAttribute("x"))).toEqual(200);
    expect(Number(rect.getAttribute("y"))).toEqual(200);
  });

  it("Should add text to rect", async () => {
    renderWrapper();

    fireEvent.click(screen.getByText("Rect"));

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

  it("Should resize a rect", async () => {
    renderWrapper();

    fireEvent.click(screen.getByText("Rect"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    const rect = screen.getByTestId("rect-svg");
    mouseDragEvent(rect, { x: 100, y: 100 }, { x: 100, y: 100 });

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
      expect(Number(rect.getAttribute("x"))).toEqual(100);
      expect(Number(rect.getAttribute("y"))).toEqual(100);
      expect(Number(rect.getAttribute("width"))).toEqual(200);
      expect(Number(rect.getAttribute("height"))).toEqual(200);
    });
  });

  it("Should rotate a rect", async () => {
    renderWrapper();

    fireEvent.click(screen.getByText("Rect"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
    const rect = screen.getByTestId("rect-svg");
    mouseDragEvent(rect, { x: 100, y: 100 }, { x: 100, y: 100 });

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
      ).toEqual("rotate(270, 150, 150)");
    });
  });

  it("Should create a circle", () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Circle"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    expect(screen.getByTestId("circle-svg")).toBeDefined();
  });

  it("Should move a circle", () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Circle"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });
    const circle = screen.getByTestId("circle-svg");
    mouseDragEvent(circle, { x: 200, y: 200 }, { x: 300, y: 300 });

    expect(Number(circle.getAttribute("cx"))).toEqual(250);
    expect(Number(circle.getAttribute("cy"))).toEqual(250);
  });

  it("Should create a line", () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Line"));
    const canvas = screen.getByTestId("canvas");

    // two separate onclick events pretty much
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 100, y: 100 });
    mouseDragEvent(canvas, { x: 200, y: 200 }, { x: 200, y: 200 });

    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();
  });

  it("Should move a line", () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Line"));
    const canvas = screen.getByTestId("canvas");

    // two separate onclick events pretty much
    mouseDragEvent(canvas, { x: 100, y: 0 }, { x: 100, y: 0 });
    mouseDragEvent(canvas, { x: 200, y: 0 }, { x: 200, y: 0 });

    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();

    mouseDragEvent(line, { x: 150, y: 0 }, { x: 150, y: 100 });
    waitFor(() => {
      expect(line.getAttribute("points")).toEqual("100,100,200,100");
    });
  });

  it("Should create a text element", () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Text"));
    const canvas = screen.getByTestId("canvas");

    // one onclick event
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 100, y: 100 });

    const text = screen.getByTestId("text");
    expect(text).toBeDefined();
  });

  it("Should move a text element", async () => {
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Text"));
    const canvas = screen.getByTestId("canvas");

    // one onclick event
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 100, y: 100 });

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
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 100, y: 100 });
    const text = screen.getByTestId("text");
    expect(text).toBeDefined();

    // create a line
    fireEvent.click(screen.getByText("Line"));
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 100, y: 100 });
    mouseDragEvent(canvas, { x: 200, y: 200 }, { x: 200, y: 200 });
    const line = screen.getByTestId("polyline");
    expect(line).toBeDefined();

    // TODO: Select all elements and move them in one go.
  });
});
