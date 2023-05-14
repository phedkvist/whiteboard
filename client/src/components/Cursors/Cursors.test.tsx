import { render } from "@testing-library/react";
import { subMinutes } from "date-fns";
import React from "react";
import { Cursor } from "../../types";
import Cursors from "./Cursors";

describe("Cursors", () => {
  it("Should display active cursors", () => {
    const cursors: Cursor[] = [
      {
        id: "blue-cursor",
        color: "#00f",
        username: "John Doe",
        lastUpdated: new Date().toISOString(),
        position: {
          x: 0,
          y: 0,
        },
      },
    ];
    const screen = render(<Cursors cursors={cursors} />);
    expect(screen.getByTestId("blue-cursor")).toBeInTheDocument();
  });

  it("Should not display inactive cursors", () => {
    const cursors: Cursor[] = [
      {
        id: "blue-cursor",
        username: "John Doe",
        color: "#00f",
        lastUpdated: subMinutes(new Date(), 2).toISOString(),
        position: {
          x: 0,
          y: 0,
        },
      },
    ];
    const screen = render(<Cursors cursors={cursors} />);
    expect(screen.queryByTestId("blue-cursor")).not.toBeInTheDocument();
  });
});

export {};
