import { useEffect, useState } from "react";
import { ViewBox, initialViewBox } from "../types";
import useWindowDimensions from "./useWindowDimensions";

export const useViewBox = (): [
  ViewBox,
  React.Dispatch<React.SetStateAction<ViewBox>>
] => {
  const [viewBox, setViewBox] = useState<ViewBox>(initialViewBox);

  const { height: h, width: w } = useWindowDimensions();
  useEffect(() => {
    if (viewBox.h !== h || viewBox.w !== w) {
      setViewBox({ ...viewBox, h, w });
    }
  }, [h, w, viewBox, setViewBox]);

  return [viewBox, setViewBox];
};
