import { ellipseStub } from "../stubs";
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
    expect(isPointInsideRect(20, 20, rectA)).toBeTruthy();
  });

  it("A point is intersecting rect on the edge", () => {
    expect(isPointInsideRect(10, 10, rectA)).toBeTruthy();
  });

  it("A point is not intersecting with a rect", () => {
    expect(isPointInsideRect(0, 0, rectA)).toBeFalsy();
  });
});

describe("Intersecting an ellipse with a point", () => {
  it("A point lies inside", () => {
    const ellipse = { ...ellipseStub, cx: 0, cy: 0, rx: 5, ry: 4 };
    expect(isPointInsideEllipse(2, 3, ellipse)).toBeTruthy();
  });

  it("A point lies outside", () => {
    const ellipse = { ...ellipseStub, cx: 0, cy: 0, rx: 5, ry: 4 };
    expect(isPointInsideEllipse(7, 2, ellipse)).toBeFalsy();
  });

  it("A point lies on the boundary", () => {
    const ellipse = { ...ellipseStub, cx: 0, cy: 0, rx: 5, ry: 3 };
    expect(isPointInsideEllipse(5, 0, ellipse)).toBeTruthy();
  });
});
