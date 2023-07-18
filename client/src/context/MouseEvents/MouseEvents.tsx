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
  Corner,
  Rect,
  Text,
  Point,
} from "../../types";
import {
  resizeRect,
  resizeEllipse,
  getMidPoints,
  MouseButtons,
  copy,
  findOverlappingElement,
} from "../../helpers/utility";
import { useAppState } from "../AppState";
import { v4 as uuid } from "uuid";
import {
  createRectAction,
  updateRectAction,
} from "../../services/Actions/Rect";
import {
  createEllipseAction,
  updateEllipseAction,
} from "../../services/Actions/Ellipse";
import {
  createTextAction,
  updateTextAction,
} from "../../services/Actions/Text";
import {
  createPolylineAction,
  updatePolylineAction,
} from "../../services/Actions/Polyline";
import * as KeyCode from "keycode-js";
import {
  findSelectedElements,
  getOverlappingPoint,
  setElementCoords,
  setupMovingElement,
  setupResizeElement,
  setupRotateElement,
} from "./helpers";
import { createDeleteChange } from "../../services/Actions";

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
    if (e.code === KeyCode.CODE_BACK_SPACE) {
      if (selectionMode.type === SelectionModes.TextEditing) return;
      const changes = selectedElements.map((id) => {
        const element = appState.elements[id];
        return createDeleteChange(element, history?.currentUserId!);
      });
      changes.forEach((c) => history?.addLocalChange(c));
      setSelectedElements([]);
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
          const elementId = id.split("-resize-")[0];
          const element = appState.elements[elementId];
          // For now only one element at a time can be resized
          setSelectedElements([elementId]);
          setupResizeElement(
            e,
            element,
            appState.elements,
            viewBox,
            setSelectionCoordinates,
            selectionCoordinates,
            setSelectionMode,
            selectionMode
          );
          break;
        } else if (id.includes("rotate")) {
          const elementId = id.split("-rotate")[0];
          const element = appState.elements[elementId];
          // For now only one element at a time can be resized
          setSelectedElements([elementId]);
          setupRotateElement(
            e,
            element,
            setSelectionCoordinates,
            selectionCoordinates,
            setSelectionMode,
            selectionMode
          );
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
        // This path is only for single select
        setSelectedElements([id]);
        const elements = [appState.elements[id]];
        setupMovingElement(
          e,
          elements,
          setSelectionCoordinates,
          selectionCoordinates
        );
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
        const renderingOrder = Object.keys(appState.elements).length + 1;

        switch (selectionMode.elementType) {
          // TODO: The first few cases can be simplified where a helper func returns the element we want to create.
          case ElementType.Rect: {
            history?.addLocalChange(
              createRectAction(
                initialX,
                initialY,
                renderingOrder,
                id,
                history?.currentUserId
              )
            );
            break;
          }
          case ElementType.Ellipse: {
            history?.addLocalChange(
              createEllipseAction(
                initialX,
                initialY,
                renderingOrder,
                id,
                history?.currentUserId
              )
            );
            break;
          }
          case ElementType.Text: {
            history?.addLocalChange(
              createTextAction(
                initialX,
                initialY,
                renderingOrder,
                id,
                history?.currentUserId
              )
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
              // TODO: Check if it should be connected to an element.
              history?.addLocalChange(
                updatePolylineAction(
                  {
                    ...creationElement,
                    state: ElementState.Visible,
                  },
                  false,
                  history?.currentUserId
                )
              );

              // Need to handle it being selected but not in selection mode which drags elements around?
              setSelectionMode({
                ...selectionMode,
                type: SelectionModes.None,
              });
              setSelectedElements([]);
            } else {
              // TODO: Check if the first point is connected to an element
              const x = initialX;
              const y = initialY;
              const overlappingElement = findOverlappingElement(
                x,
                y,
                Object.values(appState.elements)
              );
              const overlappingPoint = getOverlappingPoint(
                x,
                y,
                overlappingElement
              );
              const firstPoint: Point = {
                x,
                y,
                ...overlappingPoint,
              };
              history?.addLocalChange(
                createPolylineAction(
                  firstPoint,
                  renderingOrder,
                  id,
                  history?.currentUserId
                )
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
          const elementId = e.target.id.split("-resize")[0];
          const element = appState.elements[elementId];
          // For now only one element at a time can be resized
          setSelectedElements([elementId]);
          setupResizeElement(
            e,
            element,
            appState.elements,
            viewBox,
            setSelectionCoordinates,
            selectionCoordinates,
            setSelectionMode,
            selectionMode
          );
          break;
        } else if (e.target.id.includes("rotate")) {
          const elementId = e.target.id.split("-rotate")[0];
          const element = appState.elements[elementId];
          // For now only one element at a time can be resized
          setSelectedElements([elementId]);
          setupRotateElement(
            e,
            element,
            setSelectionCoordinates,
            selectionCoordinates,
            setSelectionMode,
            selectionMode
          );
          break;
        }

        if (!selectedElements.includes(e.target.id)) {
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.None,
          });
        }

        if (selectedElements.includes(e.target.id)) {
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.Selected,
          });
        }

        const elements = selectedElements.map((id) =>
          copy(appState.elements[id])
        );
        setupMovingElement(
          e,
          elements,
          setSelectionCoordinates,
          selectionCoordinates
        );
        break;
      }
    }
  };

  const onMouseMove: MouseEventHandler<SVGSVGElement> = (e) => {
    const { clientX, clientY, movementX, movementY } = e;
    history?.sendCursor(clientX + viewBox.x, clientY + viewBox.y);
    const isEphemeral = true;

    if (e.button !== MouseButtons.LEFT) return;

    switch (selectionMode.type) {
      case SelectionModes.Panning: {
        const { startPoint, scale } = viewBox;
        const endPoint = { x: movementX, y: movementY };
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
          findSelectedElements(
            appState.elements,
            startX,
            startY,
            currentX,
            currentY
          )
        );
        setSelectionCoordinates({
          ...selectionCoordinates,
          currentX,
          currentY,
        });
        break;
      }
      case SelectionModes.Selected: {
        const { startX, startY, originElements } = selectionCoordinates;
        selectedElements.forEach((selectedElement) => {
          const originElement = originElements.find(
            ({ id }) => id === selectedElement
          );
          if (selectedElement && startX && startY && originElement) {
            e.preventDefault();
            const diffX = clientX - startX;
            const diffY = clientY - startY;
            const dx = diffX / viewBox.scale;
            const dy = diffY / viewBox.scale;

            const element = appState.elements[selectedElement];
            const changeAction = setElementCoords(
              element,
              dx,
              dy,
              originElement,
              history?.currentUserId!
            );
            history?.addLocalChange(changeAction);
          }
        });
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
          const width = clientX + viewBox.x - creationElement.x;
          const height = clientY + viewBox.y - creationElement.y;
          history?.addLocalChange(
            updateRectAction(
              {
                ...creationElement,
                width,
                height,
                state: ElementState.Creation,
              },
              isEphemeral,
              history?.currentUserId
            )
          );
        } else if (creationElement.type === ElementType.Ellipse) {
          const { initialX, initialY } = selectionCoordinates;
          if (!(initialX && initialY)) return;
          const [rx, ry, cx, cy] = resizeEllipse(
            Corner.BottomRight,
            clientX + viewBox.x,
            clientY + viewBox.y,
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
              isEphemeral,
              history?.currentUserId
            )
          );
        } else if (creationElement.type === ElementType.Polyline) {
          const x = clientX + viewBox.x;
          const y = clientY + viewBox.y;

          const overlappingElement = findOverlappingElement(
            x,
            y,
            Object.values(appState.elements)
          );
          const overlappingPoint = getOverlappingPoint(
            x,
            y,
            overlappingElement
          );
          const endPoint: Point = {
            x,
            y,
            ...overlappingPoint,
          };
          const points = [creationElement.points[0], endPoint];
          history?.addLocalChange(
            updatePolylineAction(
              { ...creationElement, points, state: ElementState.Creation },
              isEphemeral,
              history?.currentUserId
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
                clientX + viewBox.x,
                clientY + viewBox.y,
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
                    isEphemeral,
                    history?.currentUserId
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
                    isEphemeral,
                    history?.currentUserId
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
                clientX + viewBox.x,
                clientY + viewBox.y,
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
                  isEphemeral,
                  history?.currentUserId
                )
              );
              break;
            }
            case ElementType.Polyline: {
              // TODO: Need to know which points are being dragged.
              // selected corner, set this to some kind of index?
              const newX = clientX + viewBox.x;
              const newY = clientY + viewBox.y;
              const selectedElement = selectedElements[0];
              if (!selectedElement) return;
              const el = appState.elements[selectedElement];
              if (el.type !== ElementType.Polyline) {
                return;
              }
              const newPoints = [...el.points];
              const pos = selectedCorner === Corner.TopLeft ? 0 : 1;
              newPoints[pos].x = newX;
              newPoints[pos].y = newY;
              const overlappingElement = findOverlappingElement(
                newX,
                newY,
                Object.values(appState.elements)
              );
              const overlappingPoint = getOverlappingPoint(
                newX,
                newY,
                overlappingElement
              );
              newPoints[pos] = { ...newPoints[pos], ...overlappingPoint };
              history?.addLocalChange(
                updatePolylineAction(
                  {
                    ...el,
                    points: newPoints,
                  },
                  isEphemeral,
                  history?.currentUserId
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
        let element = copy(appState.elements[selectedElement]);
        const [midX, midY] = getMidPoints(element);
        const deltaX = clientX + viewBox.x - midX;
        const deltaY = clientY + viewBox.y - midY;
        const rotate = Math.round(
          (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90
        );
        element.rotate = rotate;
        if (!history) return;
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        }
        changeAction && history?.addLocalChange(changeAction);
      }
    }
  };

  const onMouseUp: MouseEventHandler<SVGSVGElement> = (e) => {
    const isEphemeral = false;
    if (e.button !== MouseButtons.LEFT) return;
    const selectedElement = selectedElements[0];

    // On mouse up add the element to the screen
    switch (selectionMode.type) {
      case SelectionModes.Selected: {
        // TODO: If element moved, we need to set a non ephemeral change here.

        if (!selectedElement || !history) return;
        const element = copy(appState.elements[selectedElement]);
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Polyline) {
          changeAction = updatePolylineAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        }
        changeAction && history?.addLocalChange(changeAction);

        setSelectionMode({ ...selectionMode, type: SelectionModes.None });
        break;
      }
      case SelectionModes.Add: {
        // Record selection elements and draw the element directly but with faded bg?
        if (!selectedElement || !history) return;
        const element = copy(appState.elements[selectedElement]);
        if (element.type === ElementType.Polyline) {
          break;
        }
        element.state = ElementState.Visible;
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
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

        if (!selectedElement || !history) return;

        const element = copy(appState.elements[selectedElement]);
        element.state = ElementState.Visible;
        let changeAction;
        if (element.type === ElementType.Rect) {
          changeAction = updateRectAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Ellipse) {
          changeAction = updateEllipseAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Text) {
          changeAction = updateTextAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
        } else if (element.type === ElementType.Polyline) {
          // todo last update (non ephemeral):
          changeAction = updatePolylineAction(
            element,
            isEphemeral,
            history?.currentUserId
          );
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
