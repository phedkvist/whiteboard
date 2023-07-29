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
  getClientCoordinates,
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
}

const ZOOM_SENSITIVITY = 0.05;

export const MouseEventsContext = createContext<IMouseEvents | null>(null);

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
  const [isMetaPressed, setIsMetaPressed] = useState(false);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === KeyCode.CODE_ESCAPE) {
      setSelectionMode({ ...selectionMode, type: SelectionModes.None });
      setSelectedElements([]);
      setSelectionCoordinates({
        ...selectionCoordinates,
        startX: null,
        startY: null,
        currentX: null,
        currentY: null,
        currentPointIndex: 0,
      });
      return;
    }
    if (e.code === KeyCode.CODE_SPACE) {
      setIsSpacePressed(true);
    }
    if (e.code === KeyCode.CODE_BACK_SPACE) {
      if (selectionMode.type === SelectionModes.TextEditing) return;
      const changes = selectedElements
        .map((id) => {
          const element = appState.elements[id];
          return createDeleteChange(element, history?.currentUserId!);
        })
        .filter((c) => c !== null);
      changes.forEach((c) => history?.addLocalChange(c!));
      setSelectedElements([]);
    }

    if (e.code === KeyCode.CODE_META_LEFT) {
      setIsMetaPressed(true);
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === KeyCode.CODE_SPACE) {
      setIsSpacePressed(false);
    }
    if (e.code === KeyCode.CODE_META_LEFT) {
      setIsMetaPressed(false);
    }
  };

  const onScroll = (e: WheelEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }

    if (isMetaPressed) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = e.offsetX; //mouse x
      const my = e.offsetY;
      const dw = w * Math.sign(e.deltaY) * ZOOM_SENSITIVITY;
      const dh = h * Math.sign(e.deltaY) * ZOOM_SENSITIVITY;
      console.log({ dw, dh });
      const dx = (dw * mx) / window.innerWidth;
      const dy = (dh * my) / window.innerHeight;
      const newViewBox = {
        x: viewBox.x + dx,
        y: viewBox.y + dy,
        w: viewBox.w - dw,
        h: viewBox.h - dh,
      };
      const scale = viewBox.w / window.innerWidth;
      if (newViewBox.w < 100 || newViewBox.h < 100) {
        return;
      } else if (newViewBox.w > 5000 || newViewBox.h > 5000) {
        return;
      }
      setViewBox({ ...viewBox, ...newViewBox, scale });
    } else {
      setViewBox({
        ...viewBox,
        x: viewBox.x + e.deltaX,
        y: viewBox.y + e.deltaY,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("wheel", onScroll, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("wheel", onScroll);
    };
  });

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
    const clientCoordinates = getClientCoordinates(e, viewBox);
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
          const initialX = clientCoordinates.x;
          const initialY = clientCoordinates.y;
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
            setSelectionCoordinates,
            selectionCoordinates,
            setSelectionMode,
            selectionMode,
            clientCoordinates
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
            selectionMode,
            viewBox.scale
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
          selectionCoordinates,
          viewBox.scale
        );
        break;
      }
      case SelectionModes.Add: {
        const initialX = clientCoordinates.x;
        const initialY = clientCoordinates.y;
        setSelectionCoordinates({
          ...selectionCoordinates,
          initialX,
          initialY,
        });

        const renderingOrder = Object.keys(appState.elements).length + 1;

        switch (selectionMode.elementType) {
          // TODO: The first few cases can be simplified where a helper func returns the element we want to create.
          case ElementType.Rect: {
            const id = uuid();
            setSelectedElements([...selectedElements, id]);
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
            const id = uuid();
            setSelectedElements([...selectedElements, id]);
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
            const id = uuid();
            setSelectedElements([...selectedElements, id]);
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
              setSelectionCoordinates({
                ...selectionCoordinates,
                currentPointIndex: selectionCoordinates.currentPointIndex + 1,
              });
            } else {
              const id = uuid();
              setSelectedElements([...selectedElements, id]);
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
              setSelectionCoordinates({
                ...selectionCoordinates,
                currentPointIndex: 1,
              });
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
            setSelectionCoordinates,
            selectionCoordinates,
            setSelectionMode,
            selectionMode,
            clientCoordinates
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
            selectionMode,
            viewBox.scale
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
          selectionCoordinates,
          viewBox.scale
        );
        break;
      }
    }
  };

  const onMouseMove: MouseEventHandler<SVGSVGElement> = (e) => {
    const clientCoordinates = getClientCoordinates(e, viewBox);
    const { movementX, movementY } = e;

    // send cursor needs to take scaling into account
    history?.sendCursor(clientCoordinates.x, clientCoordinates.y);
    const isEphemeral = true;

    if (e.button !== MouseButtons.LEFT) return;

    switch (selectionMode.type) {
      case SelectionModes.Panning: {
        const { startPoint, scale } = viewBox;
        const endPoint = { x: movementX, y: movementY };
        const dx = (startPoint.x - endPoint.x) * scale;
        const dy = (startPoint.y - endPoint.y) * scale;
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
        const currentX = clientCoordinates.x;
        const currentY = clientCoordinates.y;
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
          if (
            selectedElement &&
            startX !== null &&
            startY !== null &&
            originElement
          ) {
            e.preventDefault();
            const diffX = e.clientX * viewBox.scale - startX;
            const diffY = e.clientY * viewBox.scale - startY;
            const dx = diffX;
            const dy = diffY;

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
          const width = clientCoordinates.x - creationElement.x;
          const height = clientCoordinates.y - creationElement.y;
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
            clientCoordinates.x,
            clientCoordinates.y,
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
          const { x, y } = clientCoordinates;

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
          const points = [...creationElement.points];
          points[selectionCoordinates.currentPointIndex] = endPoint;
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
        if (selectedElement && selectedCorner !== null) {
          switch (selectionMode.elementType) {
            case ElementType.Text:
            case ElementType.Rect: {
              const el = copy(appState.elements[selectedElement]) as
                | Rect
                | Text;
              const [width, height, x, y] = resizeRect(
                selectedCorner as Corner,
                clientCoordinates.x,
                clientCoordinates.y,
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
                selectedCorner as Corner,
                clientCoordinates.x,
                clientCoordinates.y,
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
              const newX = clientCoordinates.x;
              const newY = clientCoordinates.y;
              const selectedElement = selectedElements[0];
              if (!selectedElement) return;
              const el = appState.elements[selectedElement];
              if (el.type !== ElementType.Polyline) {
                return;
              }
              const newPoints = [...el.points];
              const pos = selectedCorner as number;
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
        const deltaX = clientCoordinates.x - midX;
        const deltaY = clientCoordinates.y - midY;
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
