import { fireEvent, render, screen } from "@testing-library/react";
import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Toolbar/Toolbar";
import { AppStateProvider } from "./AppState";
import { MouseEventsProvider } from "./MouseEvents";

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

  it("Should create a circle", () => {
    // TODO: Create a rect by firing a bunch of mouse events :)
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Circle"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    expect(screen.getByTestId("circle-svg")).toBeDefined();
  });

  it("Should move a circle", () => {
    // TODO: Create a rect by firing a bunch of mouse events :)
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Circle"));

    const canvas = screen.getByTestId("canvas");
    mouseDragEvent(canvas, { x: 100, y: 100 }, { x: 200, y: 200 });

    const circle = screen.getByTestId("circle-svg");

    mouseDragEvent(circle, { x: 200, y: 200 }, { x: 300, y: 300 });

    expect(Number(circle.getAttribute("cx"))).toEqual(250);
    expect(Number(circle.getAttribute("cy"))).toEqual(250);
  });
});
