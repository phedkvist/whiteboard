import { fireEvent, render } from "@testing-library/react";
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

describe("MouseEvents", () => {
  it("Should create a rect", () => {
    // TODO: Create a rect by firing a bunch of mouse events :)
    const screen = renderWrapper();

    fireEvent.click(screen.getByText("Rect"));

    fireEvent.mouseDown(screen.getByTestId("canvas"), {
      clientX: 100,
      clientY: 100,
    });
    fireEvent.mouseMove(screen.getByTestId("canvas"), {
      clientX: 200,
      clientY: 200,
    });
    fireEvent.mouseUp(screen.getByTestId("canvas"), {
      clientX: 200,
      clientY: 200,
    });

    screen.getByTestId("rect-svg");
  });
});
