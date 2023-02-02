import { isRectsIntersecting, isPointInsideRect } from "./intersect";

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
