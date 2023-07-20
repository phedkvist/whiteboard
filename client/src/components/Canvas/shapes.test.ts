import { rectStub } from "../../stubs";
import {
  createRoundedLine,
  createRoundedRect,
  pointCloseToCorner,
} from "./shapes";

describe("pointCloseToCorner", () => {
  it("should find a point close to corner on given line", () => {
    const point = pointCloseToCorner(0, 0, 100, 0, 10);
    expect(point).toEqual({ x: 10, y: 0 });
  });

  it("should find a point close to corner on declining line", () => {
    const point = pointCloseToCorner(0, 0, 100, 100, 10);
    const d = Math.sqrt(10 ** 2 + 10 ** 2) / 2;
    expect(point).toEqual({ x: d, y: d });
  });
});

describe("createRoundedLine", () => {
  it("should create a rounded path from coordinates", () => {
    const path = createRoundedLine([
      [0, 0],
      [100, 100],
      [0, 200],
    ]);
    expect(path).toEqual(
      "M 0 0 L 85.85786437626905 85.85786437626905 Q 100 100, 85.85786437626905 114.14213562373095 L 0 200"
    );
  });

  it("should create a rounded path from several coordinates", () => {
    const path = createRoundedLine([
      [0, 0],
      [100, 100],
      [200, 0],
      [300, 100],
    ]);
    expect(path).toEqual(
      "M 0 0 L 85.85786437626905 85.85786437626905 Q 100 100, 114.14213562373095 85.85786437626905 L 185.85786437626905 14.142135623730951 Q 200 0, 214.14213562373095 14.142135623730951 L 300 100"
    );
  });

  it("should create a straight line from two coordinates", () => {
    const path = createRoundedLine([
      [0, 0],
      [100, 0],
    ]);
    expect(path).toEqual("M 0 0 L 100 0");
  });

  it("should create a rounded path from coordinates with given radius", () => {
    const radius = 30;
    const path = createRoundedLine(
      [
        [0, 0],
        [100, 100],
        [200, 0],
        [300, 100],
      ],
      radius
    );
    expect(path).toEqual(
      "M 0 0 L 78.78679656440357 78.78679656440357 Q 100 100, 121.21320343559643 78.78679656440357 L 178.78679656440357 21.213203435596427 Q 200 0, 221.21320343559643 21.213203435596427 L 300 100"
    );
  });
});

describe("createRoundedRect", () => {
  it("should create rounded rectangle from given rect", () => {
    const path = createRoundedRect({
      ...rectStub,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    expect(path).toEqual(
      "M 10 0 L 90 0 Q 100 0, 100 10 L 100 90 Q 100 100, 90 100 L 10 100 Q 0 100, 0 90 L 0 10 Q 0 0, 10 0"
    );
  });

  it("should create rounded rectangle with specified radius", () => {
    const radius = 20;
    const path = createRoundedRect(
      {
        ...rectStub,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
      radius
    );
    expect(path).toEqual(
      "M 20 0 L 80 0 Q 100 0, 100 20 L 100 80 Q 100 100, 80 100 L 20 100 Q 0 100, 0 80 L 0 20 Q 0 0, 20 0"
    );
  });
});
