import {
  createContext,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
  WheelEventHandler,
} from "react";
import {
  SelectionModes,
  ElementType,
  ElementState,
  Element as WhiteboardElement,
  Corner,
  Rect,
  Text,
} from "../types";
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
import { isLineInsideRect, isRectsIntersecting } from "../helpers/intersect";
import * as KeyCode from "keycode-js";

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
    selectedElements,
    setSelectedElements,
    setHoverElement,
    selectionCoordinates,
    setSelectionCoordinates,
    selectionMode,
    setSelectionMode,
    viewBox,
    setViewBox,
  } = useAppState();
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const onKeyDown = (e: KeyboardEvent) => {
    const { key } = e;
    if (key === KeyCode.CODE_ESCAPE) {
      setSelectionMode({ ...selectionMode, type: SelectionModes.None });
      setSelectedElements([]);
      setSelectionCoordinates({
        ...selectionCoordinates,
        startX: null,
        startY: null,
        currentX: null,
        currentY: null,
      });
      return;
    }
    if (e.code === KeyCode.CODE_SPACE) {
      setIsSpacePressed(true);
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === KeyCode.CODE_SPACE) {
      setIsSpacePressed(false);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
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

  // Non-pure function
  // Extract all the "logic" into separate functions that can be easily tested.
  // Should return new viewbox, selectionMode,
  const onMouseDown: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== MouseButtons.LEFT) return;

    const isDoubleClick = e.detail === 2;

    switch (selectionMode.type) {
      case SelectionModes.None: {
        if (!(e.target instanceof Element)) return;
        const isPanning = e.target.id === "container" && isSpacePressed;
        const isMultiSelecting = e.target.id === "container" && !isSpacePressed;

        if (isPanning) {
          removeSelection();
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.Panning,
          });
          setViewBox({
            ...viewBox,
            startPoint: { x: e.movementX, y: e.movementY },
          });
          return;
        }
        if (isMultiSelecting) {
          setSelectedElements([]);
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.MultiSelecting,
          });
          const initialX = e.clientX / viewBox.scale + viewBox.x;
          const initialY = e.clientY / viewBox.scale + viewBox.y;
          setSelectionCoordinates({
            ...selectionCoordinates,
            initialX,
            initialY,
            startX: initialX,
            startY: initialY,
          });
          return;
        }
        const id = e.target.id;

        if (id.includes("resize")) {
          setupResizeElement(e);
          break;
        } else if (id.includes("rotate")) {
          setupRotateElement(e);
          break;
        }

        if (selectedElements !== null && !selectedElements.includes(id)) {
          removeSelection();
        } else if (selectedElements.includes(id) && isDoubleClick) {
          const e = appState.elements[id];
          if (e.type !== ElementType.Polyline) {
            setSelectionMode({
              ...selectionMode,
              type: SelectionModes.TextEditing,
            });
            break;
          }
        }
        setSelectionMode({ ...selectionMode, type: SelectionModes.Selected });
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
        setSelectedElements([...selectedElements, id]);
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
            const selectedElement = selectedElements[0];

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
              setSelectedElements([]);
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
      case SelectionModes.MultiSelecting:
      case SelectionModes.TextEditing:
      case SelectionModes.Selected: {
        if (!(e.target instanceof Element) || e.target.id === "container") {
          setSelectionMode({ ...selectionMode, type: SelectionModes.None });
          setSelectedElements([]);
          return;
        }
        if (e.target.id.includes("resize")) {
          setupResizeElement(e);
          break;
        }

        if (!selectedElements.includes(e.target.id)) {
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.None,
          });
        }

        // DRAGGING ELEMENT
        setupMovingElement(e);

        break;
      }
    }
  };

  // Non-pure function
  // Extract all the "logic" into separate functions that can be easily tested.
  const setupResizeElement: MouseEventHandler<SVGSVGElement> = (e) => {
    console.log("On resize");
    if (!(e.target instanceof Element)) return;
    const {
      x: xOffset = 0,
      y: yOffset = 0,
      width,
      height,
    } = e.target?.parentElement?.children[0].getBoundingClientRect() || {
      x: null,
      y: null,
    };
    console.log("hello");
    if (xOffset === null || yOffset === null) return;
    if (width === undefined || height === undefined) return;

    const initialX = e.clientX / viewBox.scale + viewBox.x;
    const initialY = e.clientY / viewBox.scale + viewBox.y;
    if (!(selectedElements.length > 0)) return;

    const element = copy(appState.elements[selectedElements[0]]);
    const selectedCorner = getClosestCorner(element, initialX, initialY);
    console.log("selected corner: ", selectedCorner);
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

  // Non-pure function
  // Extract all the "logic" into separate functions that can be easily tested.
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
    const selectedElement = selectedElements[0];

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

    if (selectedElements.includes(id)) {
      removeSelection();
    }
    const { x: xOffset, y: yOffset } = e.target.getBoundingClientRect();
    setSelectedElements([id]);
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

  const findSelectedElements = (
    startX: number,
    startY: number,
    currentX: number,
    currentY: number
  ): string[] => {
    const selectRect = {
      left: Math.min(startX, currentX),
      top: Math.min(startY, currentY),
      right: Math.max(startX, currentX),
      bottom: Math.max(startX, currentX),
    };
    return Object.keys(appState.elements).filter((elementId) => {
      const element = appState.elements[elementId];
      switch (element.type) {
        case ElementType.Polyline:
          return isLineInsideRect(
            element.points[0],
            element.points[1],
            element.points[2],
            element.points[3],
            selectRect
          );
        case ElementType.Rect:
        case ElementType.Text:
          return isRectsIntersecting(selectRect, {
            left: element.x,
            top: element.y,
            right: element.x + element.width,
            bottom: element.y + element.height,
          });
        case ElementType.Ellipse:
          return isRectsIntersecting(selectRect, {
            left: element.cx - element.rx,
            top: element.cy - element.ry,
            right: element.cx + element.rx,
            bottom: element.cy + element.ry,
          });
        default:
          return false;
      }
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
      case SelectionModes.MultiSelecting: {
        const currentX = e.clientX / viewBox.scale + viewBox.x;
        const currentY = e.clientY / viewBox.scale + viewBox.y;
        const { startX, startY } = selectionCoordinates;
        if (!startX || !startY) return;
        setSelectedElements(
          findSelectedElements(startX, startY, currentX, currentY)
        );
        setSelectionCoordinates({
          ...selectionCoordinates,
          currentX,
          currentY,
        });
        break;
      }
      case SelectionModes.Selected: {
        const { startX, startY, originElement } = selectionCoordinates;
        const selectedElement = selectedElements[0];

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
        const selectedElement = selectedElements[0];
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

        const selectedElement = selectedElements[0];
        const { selectedCorner } = selectionCoordinates;
        if (selectedElement && selectedCorner) {
          switch (selectionMode.elementType) {
            case ElementType.Text:
            case ElementType.Rect: {
              const el = copy(appState.elements[selectedElement]) as
                | Rect
                | Text;
              const [width, height, x, y] = resizeRect(
                selectedCorner,
                e.clientX + viewBox.x,
                e.clientY + viewBox.y,
                el
              );
              if (el.type === ElementType.Rect) {
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
              } else if (el.type === ElementType.Text) {
                history?.addLocalChange(
                  updateTextAction(
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
              }
              break;
            }
            case ElementType.Ellipse: {
              const selectedElement = selectedElements[0];
              if (!selectedElement) return;
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
            case ElementType.Polyline: {
              // TODO: Need to know which points are being dragged.
              // selected corner, set this to some kind of index?
              const newX = e.clientX + viewBox.x;
              const newY = e.clientY + viewBox.y;
              const selectedElement = selectedElements[0];
              if (!selectedElement) return;
              const el = appState.elements[selectedElement];
              if (el.type !== ElementType.Polyline) {
                return;
              }
              const newPoints = [...el.points];
              const x = selectedCorner === Corner.TopLeft ? 0 : 2;
              const y = selectedCorner === Corner.TopLeft ? 1 : 3;
              newPoints[x] = newX;
              newPoints[y] = newY;
              history?.addLocalChange(
                updatePolylineAction(
                  {
                    ...el,
                    points: newPoints,
                  },
                  true
                )
              );
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
        const selectedElement = selectedElements[0];
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
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(element, false);
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(element, false);
        }
        changeAction && history?.addLocalChange(changeAction);
      }
    }
  };

  const onMouseUp: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== MouseButtons.LEFT) return;
    const selectedElement = selectedElements[0];

    // On mouse up add the element to the screen
    switch (selectionMode.type) {
      case SelectionModes.Selected: {
        // TODO: If element moved, we need to set a non ephemeral change here.

        if (!selectedElement) return;
        const element = copy(appState.elements[selectedElement]);
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(element, false);
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(element, false);
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(element, false);
        } else if (element.type === ElementType.Polyline) {
          changeAction = updatePolylineAction(element, false);
        }
        changeAction && history?.addLocalChange(changeAction);

        setSelectionMode({ ...selectionMode, type: SelectionModes.None });
        break;
      }
      case SelectionModes.Add: {
        // Record selection elements and draw the element directly but with faded bg?
        if (!selectedElement) return;
        const element = copy(appState.elements[selectedElement]);
        if (element.type === ElementType.Polyline) {
          break;
        }
        element.state = ElementState.Visible;
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(element, false);
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(element, false);
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(element, false);
        }
        changeAction && history?.addLocalChange(changeAction);

        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.None,
        });
        setSelectedElements([]);
        break;
      }
      case SelectionModes.Rotating:
      case SelectionModes.Resizing: {
        // Size should already be set.
        // Change from resizing to selection mode.
        // TODO: Make sure every ephemeral change ends up with non ephemeral change at some point.

        if (!selectedElement) return;

        const element = copy(appState.elements[selectedElement]);
        element.state = ElementState.Visible;
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(element, false);
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(element, false);
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(element, false);
        } else if (element.type === ElementType.Polyline) {
          // todo last update (non ephemeral):
          changeAction = updatePolylineAction(element, false);
        }
        changeAction && history?.addLocalChange(changeAction);

        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.None,
        });
        setSelectedElements([]);
        break;
      }
      case SelectionModes.Panning: {
        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.None,
        });
        setSelectedElements([]);
        break;
      }
      case SelectionModes.MultiSelecting: {
        if (selectedElements.length === 0) {
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.None,
          });
        }
        setSelectionCoordinates({
          ...selectionCoordinates,
          startX: null,
          startY: null,
          currentX: null,
          currentY: null,
        });
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
    setSelectedElements([]);
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
