import { UserVersion } from "./services/ChangeTypes";
import { angleBetweenPoints, isNewerVersion } from "./utility";

describe("Utility functions", () => {
  describe("angle between points", () => {
    it("should return 45 deg", () => {
      expect(angleBetweenPoints(0, 0, 100, 100)).toEqual(45);
    });
    it("should return 0 deg", () => {
      expect(angleBetweenPoints(0, 0, 100, 0)).toEqual(0);
    });
    it("should return 0 deg", () => {
      expect(angleBetweenPoints(0, 0, 0, 100)).toEqual(90);
    });
    it("should return 180 deg", () => {
      expect(angleBetweenPoints(100, 0, 0, 0)).toEqual(180);
    });
  });

  describe("isBefore", () => {
    it("v1 is before v2 due to higher clock", () => {
      const v1: UserVersion = { userId: "a", version: 2 };
      const v2: UserVersion = { userId: "b", version: 1 };
      expect(isNewerVersion(v1, v2)).toBeTruthy();
    });
    it("v1 is before v2 due to id", () => {
      const v1: UserVersion = { userId: "a", version: 2 };
      const v2: UserVersion = { userId: "b", version: 2 };
      expect(isNewerVersion(v1, v2)).toBeTruthy();
    });
  });
});
