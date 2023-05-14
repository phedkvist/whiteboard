import { getUsername } from "./user";

describe("getUsername", () => {
  it("get random username consisting of animal and adjective", () => {
    const name = getUsername();
    const nameParts = name.split(" ");
    expect(nameParts.length).toEqual(2);
    expect(typeof name).toEqual("string");
  });
});
