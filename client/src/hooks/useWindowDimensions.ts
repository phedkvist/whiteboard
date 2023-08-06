import { useState, useEffect } from "react";

export default function useWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  const [windowDimensions, setWindowDimensions] = useState({ width, height });

  useEffect(() => {
    function handleResize() {
      const { innerWidth: width, innerHeight: height } = window;

      setWindowDimensions({ width, height });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
