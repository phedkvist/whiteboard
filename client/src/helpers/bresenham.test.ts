import { bresenham } from "./bresenham";

describe("Line between two points", () => {
  it("Should return a line between two points", () => {
    const points = bresenham(10, 10, 100, 10);
    points.forEach((point, i) => {
      expect(point.x).toEqual(i + 10);
      expect(point.y).toEqual(10);
    });
  });
});
