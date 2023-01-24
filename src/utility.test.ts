import { angleBetweenPoints } from "./utility";

describe("Utility functions", () => {
  describe("angle between points", () => {
    it("should return 45 deg", () => {
      expect(angleBetweenPoints(0, 0, 100, 100)).toEqual(45);
    });
  });
});
