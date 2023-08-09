import { UserVersion } from "../services/ChangeTypes";
import { ellipseStub, rectStub, textStub } from "../stubs";
import {
  angleBetweenPoints,
  findOverlappingElement,
  isNewerVersion,
} from "./utility";

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

describe("findOverlappingElements", () => {
  it("the point is inside a rect element", () => {
    const element = findOverlappingElement(1, 1, [rectStub]);
    expect(element).toEqual(rectStub);
  });

  it("the point is inside a text element", () => {
    const element = findOverlappingElement(1, 1, [textStub]);
    expect(element).toEqual(textStub);
  });

  it("the point is inside the ellipse element", () => {
    const element = findOverlappingElement(1, 1, [ellipseStub]);
    expect(element).toEqual(ellipseStub);
  });

  it("the point is outside all elements", () => {
    const element = findOverlappingElement(25, 25, [
      rectStub,
      textStub,
      ellipseStub,
    ]);
    expect(element).toBeUndefined();
  });
});
