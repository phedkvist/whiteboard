import {
  createContext,
  MouseEventHandler,
  useContext,
  useEffect,
  WheelEventHandler,
} from "react";
import {
  SelectionModes,
  ElementType,
  ElementState,
  Element as WhiteboardElement,
  Corner,
} from "../Types";
import {
  getClosestCorner,
  resizeRect,
  resizeEllipse,
  getMidPoints,
  MouseButtons,
  copy,
} from "../utility";
import { useAppState } from "./AppState";
import { v4 as uuid } from "uuid";
import { createRectAction, updateRectAction } from "../services/Actions/Rect";
import {
  createEllipseAction,
  updateEllipseAction,
} from "../services/Actions/Ellipse";
import { createTextAction, updateTextAction } from "../services/Actions/Text";
import {
  createPolylineAction,
  updatePolylineAction,
} from "../services/Actions/Polyline";
import { createUpdateChangeAction } from "../services/ChangeTypes";

// create a context with all of the mouse event handlers, that can be plugged into the canvas.
// might be able to move certain "mouse event" related state into this context.

interface IMouseEvents {
  onMouseOver: MouseEventHandler<SVGSVGElement>;
  onMouseDown: MouseEventHandler<SVGSVGElement>;
  onMouseUp: MouseEventHandler<SVGSVGElement>;
  onMouseMove: MouseEventHandler<SVGSVGElement>;
  onMouseWheel: WheelEventHandler<SVGSVGElement>;
}

export const MouseEventsContext = createContext<IMouseEvents | null>(null);

// const width = 2000;
// const height = 1000;
// const ZOOM_SENSITIVITY = 0.05;

export const MouseEventsProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const {
    appState,
    history,
    selectedElement,
    setSelectedElement,
    setHoverElement,
    selectionCoordinates,
    setSelectionCoordinates,
    selectionMode,
    setSelectionMode,
    viewBox,
    setViewBox,
  } = useAppState();

  const onKeyDown = (e: KeyboardEvent) => {
    switch (selectionMode.type) {
      case SelectionModes.TextEditing: {
        if (selectedElement) {
          const { key } = e;
          if (key === "Escape") {
            setSelectionMode({ ...selectionMode, type: SelectionModes.None });
            setSelectedElement(null);
            return;
          }
        }
        break;
      }
      default: {
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  const onMouseWheel: WheelEventHandler<SVGSVGElement> = (e) => {
    // https://stackoverflow.com/questions/52576376/how-to-zoom-in-on-a-complex-svg-structure
    // if (selectionMode.type !== SelectionModes.None) return;
    // e.preventDefault();
    // const w = viewBox.w;
    // const h = viewBox.h;
    // const mx = e.pageX; //mouse x
    // const my = e.pageY;
    // const dw = w * Math.sign(e.deltaY) * ZOOM_SENSITIVITY;
    // const dh = h * Math.sign(e.deltaY) * ZOOM_SENSITIVITY;
    // const dx = (dw * mx) / width;
    // const dy = (dh * my) / height;
    // const newViewBox = {
    //   x: viewBox.x + dx,
    //   y: viewBox.y + dy,
    //   w: viewBox.w - dw,
    //   h: viewBox.h - dh,
    // };
    // const scale = width / viewBox.w;
    // zoomValue.innerText = `${Math.round(scale * 100) / 100}`;
    // svgImage.setAttribute(
    //   "viewBox",
    //   `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
    // );
    // console.log("SCALE: ", scale);
    // console.log("VIEWBOX: ", viewBox);
    // setViewBox({ ...viewBox, ...newViewBox, scale });
    // e.stopPropagation();
  };

  const onMouseOver: MouseEventHandler<SVGSVGElement> = (e) => {
    if (!(e.target instanceof Element) || e.target.id === "container") {
      setHoverElement(null);
      return;
    }
    setHoverElement(e.target.id);
  };

  const onMouseDown: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== MouseButtons.LEFT) return;

    switch (selectionMode.type) {
      case SelectionModes.None: {
        if (!(e.target instanceof Element) || e.target.id === "container") {
          removeSelection();
          setSelectionMode({ ...selectionMode, type: SelectionModes.Panning });
          setViewBox({
            ...viewBox,
            startPoint: { x: e.movementX, y: e.movementY },
          });
          return;
        }
        const id = e.target.id;

        if (id.includes("resize")) {
          // TODO: Might need to add elementType below as well :)
          setupResizeElement(e);
          break;
        } else if (id.includes("rotate")) {
          setupRotateElement(e);
          break;
        }

        if (selectedElement !== null && id !== selectedElement) {
          removeSelection();
        } else if (id === selectedElement) {
          // IN edit text mode.
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.TextEditing,
          });
          break;
        }
        setSelectionMode({ ...selectionMode, type: SelectionModes.Selected });
        // DRAGGING ELEMENT
        setupMovingElement(e);
        break;
      }
      case SelectionModes.Add: {
        const initialX = e.clientX + viewBox.x;
        const initialY = e.clientY + viewBox.y;
        setSelectionCoordinates({
          ...selectionCoordinates,
          initialX,
          initialY,
        });
        const id = uuid();
        setSelectedElement(id);
        const renderingOrder = appState.elementsCount + 1;

        switch (selectionMode.elementType) {
          // TODO: The first few cases can be simplified where a helper func returns the element we want to create.
          case ElementType.Rect: {
            history?.addLocalChange(
              createRectAction(initialX, initialY, renderingOrder, id)
            );
            break;
          }
          case ElementType.Ellipse: {
            history?.addLocalChange(
              createEllipseAction(initialX, initialY, renderingOrder, id)
            );
            break;
          }
          case ElementType.Text: {
            history?.addLocalChange(
              createTextAction(initialX, initialY, renderingOrder, id)
            );
            break;
          }
          case ElementType.Polyline: {
            if (selectedElement) {
              // Second part of drawing the line.
              const creationElement = copy(appState.elements[selectedElement]);
              if (creationElement.type !== ElementType.Polyline) {
                throw new Error(
                  "Expected selected element to be a polyline element"
                );
              }
              history?.addLocalChange(
                updatePolylineAction(
                  {
                    ...creationElement,
                    state: ElementState.Visible,
                  },
                  false
                )
              );

              // Need to handle it being selected but not in selection mode which drags elements around?
              setSelectionMode({
                ...selectionMode,
                type: SelectionModes.None,
              });
              setSelectedElement(null);
            } else {
              history?.addLocalChange(
                createPolylineAction(initialX, initialY, renderingOrder, id)
              );
              break;
            }
            break;
          }
        }
        break;
      }
      case SelectionModes.TextEditing:
      case SelectionModes.Selected: {
        if (!(e.target instanceof Element) || e.target.id === "container") {
          setSelectionMode({ ...selectionMode, type: SelectionModes.None });
          setSelectedElement(null);
          return;
        }
        // DRAGGING ELEMENT
        setupMovingElement(e);

        break;
      }
    }
  };

  const setupResizeElement: MouseEventHandler<SVGSVGElement> = (e) => {
    if (!(e.target instanceof Element)) return;
    const {
      x: xOffset,
      y: yOffset,
      width,
      height,
    } = e.target?.parentElement?.children[0].getBoundingClientRect() || {
      x: null,
      y: null,
    };
    if (!xOffset || !yOffset) return;
    const initialX = e.clientX / viewBox.scale + viewBox.x;
    const initialY = e.clientY / viewBox.scale + viewBox.y;
    console.log("INITIAL XY:", initialX, initialY);
    if (!selectedElement) return;
    const element = copy(appState.elements[selectedElement]);
    const selectedCorner = getClosestCorner(element, initialX, initialY);
    if (!selectedCorner) return;
    setSelectionCoordinates({
      ...selectionCoordinates,
      xOffset,
      yOffset,
      initialX,
      initialY,
      initialWidth: width,
      initialHeight: height,
      selectedCorner,
    });
    setSelectionMode({
      ...selectionMode,
      elementType: element.type,
      type: SelectionModes.Resizing,
    });
  };

  const setupRotateElement: MouseEventHandler<SVGSVGElement> = (e) => {
    if (!(e.target instanceof Element)) return;
    const { width, height } =
      e.target?.parentElement?.children[0].getBoundingClientRect() || {
        x: null,
        y: null,
      };
    if (!(width && height)) return;
    const initialX = e.clientX;
    const initialY = e.clientY;
    setSelectionCoordinates({
      ...selectionCoordinates,
      initialX,
      initialY,
      initialWidth: width,
      initialHeight: height,
    });
    if (!selectedElement) return;
    const element = appState.elements[selectedElement];
    setSelectionMode({
      ...selectionMode,
      elementType: element.type,
      type: SelectionModes.Rotating,
    });
  };

  const setupMovingElement: MouseEventHandler<SVGSVGElement> = (e) => {
    if (!(e.target instanceof Element)) return;
    const id = e.target.id;
    if (selectedElement !== null && id !== selectedElement) {
      removeSelection();
    }
    const { x: xOffset, y: yOffset } = e.target.getBoundingClientRect();
    setSelectedElement(id);
    const initialX = e.clientX - xOffset;
    const initialY = e.clientY - yOffset;
    const originElement = copy(appState.elements[id]);
    setSelectionCoordinates({
      ...selectionCoordinates,
      initialX,
      initialY,
      startX: e.clientX,
      startY: e.clientY,
      originElement,
    });
  };

  const onMouseMove: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== MouseButtons.LEFT) return;

    switch (selectionMode.type) {
      case SelectionModes.Panning: {
        const { startPoint, scale } = viewBox;
        const endPoint = { x: e.movementX, y: e.movementY };
        const dx = (startPoint.x - endPoint.x) / scale;
        const dy = (startPoint.y - endPoint.y) / scale;
        const movedViewBox = {
          x: viewBox.x + dx,
          y: viewBox.y + dy,
          w: viewBox.w,
          h: viewBox.h,
        };
        setViewBox({ ...viewBox, ...movedViewBox });
        break;
      }
      case SelectionModes.Selected: {
        const { startX, startY, originElement } = selectionCoordinates;
        if (selectedElement && startX && startY && originElement) {
          e.preventDefault();
          const diffX = e.clientX - startX;
          const diffY = e.clientY - startY;

          setElementCoords(
            selectedElement,
            diffX / viewBox.scale,
            diffY / viewBox.scale,
            originElement
          );
          setSelectionCoordinates({
            ...selectionCoordinates,
          });
        }
        break;
      }
      case SelectionModes.Add: {
        if (!selectedElement) return;
        const newAppState = Object.assign({}, appState);
        // Update actions with ephemeral set to true.
        const creationElement = Object.assign(
          {},
          newAppState.elements[selectedElement]
        );
        if (creationElement.type === ElementType.Rect) {
          const width = e.clientX + viewBox.x - creationElement.x;
          const height = e.clientY + viewBox.y - creationElement.y;
          history?.addLocalChange(
            updateRectAction(
              {
                ...creationElement,
                width,
                height,
                state: ElementState.Creation,
              },
              true
            )
          );
        } else if (creationElement.type === ElementType.Ellipse) {
          const { initialX, initialY } = selectionCoordinates;
          if (!(initialX && initialY)) return;
          const [rx, ry, cx, cy] = resizeEllipse(
            Corner.BottomRight,
            e.clientX + viewBox.x,
            e.clientY + viewBox.y,
            creationElement
          );
          history?.addLocalChange(
            updateEllipseAction(
              {
                ...creationElement,
                rx,
                ry,
                cx,
                cy,
                state: ElementState.Creation,
              },
              true
            )
          );
        } else if (creationElement.type === ElementType.Polyline) {
          const points = [
            creationElement.points[0],
            creationElement.points[1],
            e.clientX + viewBox.x,
            e.clientY + viewBox.y,
          ];
          history?.addLocalChange(
            updatePolylineAction(
              { ...creationElement, points, state: ElementState.Creation },
              true
            )
          );
        }
        break;
      }
      case SelectionModes.Resizing: {
        e.preventDefault();

        const { selectedCorner } = selectionCoordinates;
        if (selectedElement && selectedCorner) {
          switch (selectionMode.elementType) {
            case ElementType.Rect: {
              const el = copy(appState.elements[selectedElement]);
              if (el.type !== ElementType.Rect) return;
              const [width, height, x, y] = resizeRect(
                selectedCorner,
                e.clientX + viewBox.x,
                e.clientY + viewBox.y,
                el
              );
              history?.addLocalChange(
                updateRectAction(
                  {
                    ...el,
                    width,
                    height,
                    x,
                    y,
                  },
                  true
                )
              );
              break;
            }
            case ElementType.Ellipse: {
              const obj = copy(appState.elements[selectedElement]);
              if (!obj || obj.type !== ElementType.Ellipse) return;
              const [rx, ry, cx, cy] = resizeEllipse(
                selectedCorner,
                e.clientX + viewBox.x,
                e.clientY + viewBox.y,
                obj
              );
              history?.addLocalChange(
                updateEllipseAction(
                  {
                    ...obj,
                    rx,
                    ry,
                    cx,
                    cy,
                  },
                  true
                )
              );
              break;
            }
          }
        }

        break;
      }
      case SelectionModes.Rotating: {
        // Calc c from initialX & initialY with current client X,Y.
        // Get middle point of figure. And get the lines between prev two points
        // Set the radius accordingly
        // Take into account different types of elements.

        if (!selectedElement) return;
        const { clientX, clientY } = e;
        let element = copy(appState.elements[selectedElement]);
        const [midX, midY] = getMidPoints(element);
        const deltaX = clientX + viewBox.x - midX;
        const deltaY = clientY + viewBox.y - midY;
        const rotate = Math.round(
          (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90
        );
        element.rotate = rotate;
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(element, false);
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(element, false);
        }
        changeAction && history?.addLocalChange(changeAction);
      }
    }
  };

  const onMouseUp: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== MouseButtons.LEFT) return;

    // On mouse up add the element to the screen
    switch (selectionMode.type) {
      case SelectionModes.Selected: {
        // TODO: If element moved, we need to set a non ephemeral change here.
        if (!selectedElement) return;
        const creationElement = copy(appState.elements[selectedElement]);
        let changeAction;
        if (creationElement.type === ElementType.Rect) {
          changeAction = updateRectAction(creationElement, false);
        } else if (creationElement.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(creationElement, false);
        } else if (creationElement.type === ElementType.Text) {
          changeAction = updateTextAction(creationElement, false);
        } else if (creationElement.type === ElementType.Polyline) {
          changeAction = updatePolylineAction(creationElement, false);
        }
        changeAction && history?.addLocalChange(changeAction);

        setSelectionMode({ ...selectionMode, type: SelectionModes.None });
        break;
      }
      case SelectionModes.Add: {
        // Record selection elements and draw the element directly but with faded bg?
        if (!selectedElement) return;
        const creationElement = copy(appState.elements[selectedElement]);
        if (creationElement.type === ElementType.Polyline) {
          break;
        }
        creationElement.state = ElementState.Visible;
        let changeAction;
        if (creationElement.type === ElementType.Rect) {
          changeAction = updateRectAction(creationElement, false);
        } else if (creationElement.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(creationElement, false);
        } else if (creationElement.type === ElementType.Text) {
          changeAction = updateTextAction(creationElement, false);
        }
        changeAction && history?.addLocalChange(changeAction);

        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.None,
        });
        setSelectedElement(null);
        break;
      }
      case SelectionModes.Rotating:
      case SelectionModes.Resizing: {
        // Size should already be set.
        // Change from resizing to selection mode.
        // TODO: Make sure every ephemeral change ends up with non ephemeral change at some point.
        if (!selectedElement) return;

        const creationElement = copy(appState.elements[selectedElement]);
        if (creationElement.type === ElementType.Polyline) {
          break;
        }
        creationElement.state = ElementState.Visible;
        let changeAction;
        if (creationElement.type === ElementType.Rect) {
          changeAction = updateRectAction(creationElement, false);
        } else if (creationElement.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(creationElement, false);
        } else if (creationElement.type === ElementType.Text) {
          changeAction = updateTextAction(creationElement, false);
        }
        changeAction && history?.addLocalChange(changeAction);

        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.None,
        });
        setSelectedElement(null);
        break;
      }
      case SelectionModes.Panning: {
        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.None,
        });
        setSelectedElement(null);
        break;
      }
    }
  };

  // const onMouseLeave: MouseEventHandler<SVGSVGElement> = (e) => {};

  const setElementCoords = (
    id: string,
    diffX: number,
    diffY: number,
    originElement: WhiteboardElement
  ) => {
    const obj = copy(appState.elements[id]);
    let changeAction;
    if (!obj) {
      throw new Error(`Can't find element with id: ${id} on the screen.`);
    }
    if (
      obj.type === ElementType.Ellipse &&
      originElement.type === ElementType.Ellipse
    ) {
      obj.cx = diffX + originElement.cx;
      obj.cy = diffY + originElement.cy;
      changeAction = updateEllipseAction(obj, true);
    } else if (
      obj.type === ElementType.Rect &&
      originElement.type === ElementType.Rect
    ) {
      obj.x = originElement.x + diffX;
      obj.y = originElement.y + diffY;
      changeAction = updateRectAction(obj, true);
    } else if (
      obj.type === ElementType.Text &&
      originElement.type === ElementType.Text
    ) {
      obj.x = originElement.x + diffX;
      obj.y = originElement.y + diffY;
      changeAction = updateTextAction(obj, true);
    } else if (
      obj.type === ElementType.Polyline &&
      originElement.type === ElementType.Polyline
    ) {
      const newPoints = originElement.points.map((v, i) =>
        i % 2 === 0 || i === 0 ? v + diffX : v + diffY
      );
      obj.points = newPoints;
      changeAction = updatePolylineAction(obj, true);
    } else {
      throw new Error("Something went wrong in set element coords");
    }

    if (changeAction) {
      history?.addLocalChange(changeAction);
    }
  };

  const removeSelection = () => {
    setSelectedElement(null);
  };
  return (
    <MouseEventsContext.Provider
      value={{
        onMouseOver,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseWheel,
      }}
    >
      {children}
    </MouseEventsContext.Provider>
  );
};

export const useMouseEvents = () => {
  const context = useContext(MouseEventsContext);
  if (context === null) {
    throw new Error("useMouseEvents must be used within a MouseEventsProvider");
  }
  return context;
};
