import { ellipseStub, rectStub } from "../stubs";
import { Ellipse } from "../types";
import {
  isRectsIntersecting,
  isPointInsideRect,
  isPointInsideEllipse,
} from "./intersect";

const rectA = {
  left: 10,
  top: 10,
  right: 30,
  bottom: 30,
};

const rectB = {
  left: 20,
  top: 20,
  right: 50,
  bottom: 50,
};

const rectC = {
  left: 70,
  top: 70,
  right: 90,
  bottom: 90,
};

describe("Intersecting rect with another rect", () => {
  it("Two rects should intersect", () => {
    expect(isRectsIntersecting(rectA, rectB)).toBeTruthy();
  });

  it("Two rects should not intersect", () => {
    expect(isRectsIntersecting(rectA, rectC)).toBeFalsy();
  });
});

describe("Intersecting rect with a point", () => {
  it("A point intersects with a rect", () => {
    const rect = { ...rectStub, x: 10, y: 10, width: 20, height: 20 };
    expect(isPointInsideRect(20, 20, rect)).toBeTruthy();
  });

  it("A point is intersecting rect on the edge", () => {
    const rect = { ...rectStub, x: 10, y: 10, width: 20, height: 20 };

    expect(isPointInsideRect(10, 10, rect)).toBeTruthy();
  });

  it("A point is not intersecting with a rect", () => {
    const rect = { ...rectStub, x: 10, y: 10, width: 20, height: 20 };
    expect(isPointInsideRect(0, 0, rect)).toBeFalsy();
  });

  it("A point is inside the rotated rectangle", () => {
    const rect = { ...rectStub, x: 0, y: 0, width: 4, height: 4, rotate: 45 };
    expect(isPointInsideRect(2, 2, rect)).toBeTruthy();
  });

  it("A point is outside the rotated rectangle", () => {
    const rect = { ...rectStub, x: 0, y: 0, width: 4, height: 4, rotate: 45 };
    expect(isPointInsideRect(6, 6, rect)).toBeFalsy();
  });

  it("A point is on the edge of the rotated rect", () => {
    const rect = { ...rectStub, x: 0, y: 0, width: 4, height: 4, rotate: 45 };
    expect(isPointInsideRect(2, 0, rect)).toBeTruthy();
  });
});

describe("Intersecting an ellipse with a point", () => {
  it("A point lies inside", () => {
    expect(isPointInsideEllipse(2, 3, 0, 0, 5, 4, 0)).toBeTruthy();
  });

  it("A point lies outside", () => {
    expect(isPointInsideEllipse(7, 2, 0, 0, 5, 4, 0)).toBeFalsy();
  });

  it("A point lies on the boundary", () => {
    expect(isPointInsideEllipse(5, 0, 0, 0, 5, 3, 0)).toBeTruthy();
  });

  it("A point lies inside the rotated ellipse", () => {
    expect(isPointInsideEllipse(2, 1, 0, 0, 4, 3, 45)).toBeTruthy();
  });

  it("A point lies outside the rotated ellipse", () => {
    expect(isPointInsideEllipse(5, 2, 0, 0, 4, 3, 45)).toBeFalsy();
  });

  it("A point lies on the boundary of the rotated ellipse", () => {
    expect(isPointInsideEllipse(0, 3, 0, 0, 4, 3, 45)).toBeTruthy();
  });
});
