import { useEffect, useCallback, useState } from "react";

const NON_CONTEXT_MENU_DIVS = ["properties", "edit", "debugger", "toolbar"];

const isExcludedFromContextMenu = (e: MouseEvent) => {
  if (!e.target) return;
  if (!("id" in e.target)) return;
  const { id = "" } = e.target;
  return NON_CONTEXT_MENU_DIVS.some((excludedId) => id.includes(excludedId));
};

const useContextMenu = () => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      if (isExcludedFromContextMenu(e)) {
        return;
      }
      e.preventDefault();
      setAnchorPoint({ x: e.pageX, y: e.pageY });
      setShow(true);
    },
    [setShow, setAnchorPoint]
  );

  const handleClick = useCallback(() => show && setShow(false), [show]);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  });

  return { anchorPoint, show };
};

export default useContextMenu;
