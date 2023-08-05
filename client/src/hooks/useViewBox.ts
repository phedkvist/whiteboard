import { useLayoutEffect, useState } from "react";
import { ViewBox, initialViewBox } from "../types";
import useWindowDimensions from "./useWindowDimensions";

const isWindowDimensionsUpdated = (
  w1: ReturnType<typeof useWindowDimensions>,
  w2: ReturnType<typeof useWindowDimensions>
) => {
  return w1.height !== w2.height || w1.width !== w2.width;
};

export const useViewBox = (): [
  ViewBox,
  React.Dispatch<React.SetStateAction<ViewBox>>
] => {
  const [viewBox, setViewBox] = useState<ViewBox>(initialViewBox(window));
  const currentWindowDimension = useWindowDimensions();

  const [windowDimension, setWindowDimensions] = useState(
    currentWindowDimension
  );

  useLayoutEffect(() => {
    // This will adjust the viewBox when the window size changes
    if (isWindowDimensionsUpdated(windowDimension, currentWindowDimension)) {
      const diffH = windowDimension.height - currentWindowDimension.height;
      const diffW = windowDimension.width - currentWindowDimension.width;

      setViewBox({
        ...viewBox,
        h: viewBox.h - diffH * viewBox.scale,
        w: viewBox.w - diffW * viewBox.scale,
      });
      setWindowDimensions(currentWindowDimension);
    }
  }, [viewBox, setViewBox, currentWindowDimension]);

  return [viewBox, setViewBox];
};
