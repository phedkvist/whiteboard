import { act, fireEvent, renderHook, waitFor } from "@testing-library/react";
import { useViewBox } from "./useViewBox";

describe("useViewBox", () => {
  afterEach(() => {
    window.innerHeight = 768;
    window.innerWidth = 1024;
  });
  it("should initiate based on the width and height of the window", () => {
    const { result } = renderHook(() => useViewBox());
    const [viewBox] = result.current;
    expect(viewBox).toEqual({
      w: 1024,
      h: 768,
      scale: 1,
      x: 0,
      y: 0,
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 0, y: 0 },
    });
  });

  it("should resize viewBox when user alters the window size", async () => {
    const hook = renderHook(() => useViewBox());
    const [viewBox] = hook.result.current;
    expect(viewBox.w).toEqual(1024);
    expect(viewBox.h).toEqual(768);
    act(() => {
      window.innerHeight = 1000;
      window.innerWidth = 2048;
      fireEvent(window, new Event("resize"));
    });

    await waitFor(() => {
      hook.rerender();
      const [viewBox] = hook.result.current;
      expect(viewBox.h).toEqual(1000);
      expect(viewBox.w).toEqual(2048);
    });
  });

  it("should resize viewBox when setViewBox is called", async () => {
    const hook = renderHook(() => useViewBox());
    const [viewBox, setViewBox] = hook.result.current;
    expect(viewBox.w).toEqual(1024);
    expect(viewBox.h).toEqual(768);
    act(() => {
      setViewBox({ ...viewBox, h: 1000, w: 2048, scale: 0.5 });
    });

    await waitFor(() => {
      hook.rerender();
      const [viewBox] = hook.result.current;
      expect(viewBox.h).toEqual(1000);
      expect(viewBox.w).toEqual(2048);
      expect(viewBox.scale).toEqual(0.5);
    });
  });
});
