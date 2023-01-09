import { intersectRect } from "../intersect";

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
  it("a & b should intersect", () => {
    expect(intersectRect(rectA, rectB)).toBeTruthy();
  });

  it("a & c should not intersect", () => {
    expect(intersectRect(rectA, rectC)).toBeFalsy();
  });
});
