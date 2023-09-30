import { createContext, MouseEventHandler, useContext } from "react";
import {
  SelectionModes,
  ElementType,
  ElementState,
  Corner,
  Rect,
  Text,
  Point,
  Diamond,
  Ellipse,
} from "../../types";
import {
  resizeRect,
  getMidPoints,
  MouseButtons,
  copy,
} from "../../helpers/utility";
import { useAppState } from "../AppState";
import { v4 as uuid } from "uuid";

import {
  createPolylineAction,
  updatePolylineAction,
} from "../../services/Actions/Polyline";
import {
  extractElementId,
  findSelectedElements,
  getClientCoordinates,
  getClosestElementId,
  getElementFromId,
  getOverlappingPoint,
  isPointSame,
  SelectionAction,
  setElementCoords,
  setupMovingElement,
  setupResizeElement,
  setupRotateElement,
} from "./helpers";
import { createNewChange, createUpdateChange } from "../../services/Actions";
import { useKeyboardEvents } from "../KeyboardEvents/useKeyboardEvents";
import * as E from "fp-ts/Either";

import { pipe } from "fp-ts/lib/function";

interface IMouseEvents {
  onMouseOver: MouseEventHandler<SVGSVGElement>;
  onMouseDown: MouseEventHandler<SVGSVGElement>;
  onMouseUp: MouseEventHandler<SVGSVGElement>;
  onMouseMove: MouseEventHandler<SVGSVGElement>;
}

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

  const [isSpacePressed] = useKeyboardEvents();

  const onMouseOver: MouseEventHandler<SVGSVGElement> = (e) => {
    if (!(e.target instanceof Element) || e.target.id === "container") {
      setHoverElement(null);
      return;
    }
    setHoverElement(e.target.id);
  };

  const onMouseDown: MouseEventHandler<SVGSVGElement> = (e) => {
    const clientCoordinates = getClientCoordinates(e, viewBox);
    if (e.button !== MouseButtons.LEFT) return;

    const isDoubleClick = e.detail === 2;
    const matchFunc = E.match<string, SelectionAction, void>(
      (message: string) => console.error(message),
      ({ selectionCoordinates, selectionMode }) => {
        setSelectionCoordinates(selectionCoordinates);
        setSelectionMode(selectionMode);
      }
    );

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
          const { x, y } = clientCoordinates;
          setSelectionCoordinates({
            ...selectionCoordinates,
            initialX: x,
            initialY: y,
            startX: x,
            startY: y,
          });
          return;
        }
        const id = getClosestElementId(e);

        if (!id) {
          return;
        }
        const isResizing = id.includes("resize");
        const isRotating = id.includes("rotate");

        if (isResizing) {
          const elementId = id.split("-resize-")[0];
          // For now only one element at a time can be resized
          setSelectedElements([elementId]);
          pipe(
            extractElementId(e.target.id, "-resize-"),
            E.chain(getElementFromId(appState.elements)),
            E.chain(
              setupResizeElement(
                e,
                selectionCoordinates,
                selectionMode,
                clientCoordinates
              )
            ),
            matchFunc
          );
          break;
        } else if (isRotating) {
          const elementId = id.split("-rotate")[0];
          setSelectedElements([elementId]);
          pipe(
            extractElementId(e.target.id, "-rotate"),
            E.chain(getElementFromId(appState.elements)),
            E.chain(
              setupRotateElement(
                e,
                selectionCoordinates,
                selectionMode,
                viewBox.scale
              )
            ),
            matchFunc
          );
          break;
        }

        if (!selectedElements.includes(id)) {
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
        const { x, y } = clientCoordinates;
        setSelectionCoordinates({
          ...selectionCoordinates,
          initialX: x,
          initialY: y,
        });

        const renderingOrder = Object.keys(appState.elements).length + 1;

        // For add mode, just pass in data to a func, we get left or right, if right, create an object.

        switch (selectionMode.elementType) {
          // TODO: The first few cases can be simplified where a helper func returns the element we want to create.
          case ElementType.Rect:
          case ElementType.Ellipse:
          case ElementType.Text:
          case ElementType.Diamond: {
            const id = uuid();
            setSelectedElements([...selectedElements, id]);
            const change = createNewChange(
              selectionMode.elementType,
              x,
              y,
              renderingOrder,
              id,
              history.currentUserId
            );
            change && history.addLocalChange(change);
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
              history.addLocalChange(
                updatePolylineAction(
                  {
                    ...creationElement,
                    state: ElementState.Visible,
                  },
                  false,
                  history.currentUserId
                )
              );

              // Need to handle it being selected but not in selection mode which drags elements around?
              setSelectionCoordinates({
                ...selectionCoordinates,
                currentPointIndex: selectionCoordinates.currentPointIndex + 1,
                nextPointIndex: selectionCoordinates.nextPointIndex + 1,
              });
            } else {
              const id = uuid();
              setSelectedElements([...selectedElements, id]);
              const firstPoint: Point = getOverlappingPoint(
                x,
                y,
                Object.values(appState.elements)
              );
              history.addLocalChange(
                createPolylineAction(
                  firstPoint,
                  renderingOrder,
                  id,
                  history.currentUserId
                )
              );
              setSelectionCoordinates({
                ...selectionCoordinates,
                currentPointIndex: 0,
                nextPointIndex: 1,
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
          // For now only one element at a time can be resized
          setSelectedElements([elementId]);
          pipe(
            extractElementId(e.target.id, "-resize"),
            E.chain(getElementFromId(appState.elements)),
            E.chain(
              setupResizeElement(
                e,
                selectionCoordinates,
                selectionMode,
                clientCoordinates
              )
            ),
            matchFunc
          );
          break;
        } else if (e.target.id.includes("rotate")) {
          const elementId = e.target.id.split("-rotate")[0];
          setSelectedElements([elementId]);
          pipe(
            extractElementId(e.target.id, "-rotate"),
            E.chain(getElementFromId(appState.elements)),
            E.chain(
              setupRotateElement(
                e,
                selectionCoordinates,
                selectionMode,
                viewBox.scale
              )
            ),
            matchFunc
          );
          break;
        }

        const id = getClosestElementId(e) || e.target.id;

        if (!selectedElements.includes(id)) {
          setSelectionMode({
            ...selectionMode,
            type: SelectionModes.None,
          });
        }

        if (selectedElements.includes(id)) {
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

    history.sendCursor(clientCoordinates.x, clientCoordinates.y);
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
              history.currentUserId
            );
            history.addLocalChange(changeAction);
          }
        });
        break;
      }
      case SelectionModes.Add: {
        const selectedElement = selectedElements[0];
        if (!selectedElement) return;
        const newAppState = Object.assign({}, appState);
        // Update actions with ephemeral set to true.
        const creationElement = copy(newAppState.elements[selectedElement]);
        switch (creationElement.type) {
          case ElementType.Rect:
          case ElementType.Diamond:
          case ElementType.Ellipse: {
            const width = clientCoordinates.x - creationElement.x;
            const height = clientCoordinates.y - creationElement.y;
            const change = createUpdateChange(
              {
                ...creationElement,
                width,
                height,
                state: ElementState.Creation,
              },
              isEphemeral,
              history.currentUserId
            );
            change && history.addLocalChange(change);
            break;
          }
          case ElementType.Polyline: {
            const { x, y } = clientCoordinates;

            const endPoint = getOverlappingPoint(
              x,
              y,
              Object.values(appState.elements)
            );
            const points = [...creationElement.points];
            const prevPoint = points[selectionCoordinates.nextPointIndex - 1];
            const isPointsSame = isPointSame(prevPoint, endPoint);
            if (!isPointsSame) {
              points[selectionCoordinates.nextPointIndex] = endPoint;
            }
            history.addLocalChange(
              updatePolylineAction(
                { ...creationElement, points, state: ElementState.Creation },
                isEphemeral,
                history.currentUserId
              )
            );
            break;
          }
        }
        break;
      }
      case SelectionModes.Resizing: {
        e.preventDefault();

        const selectedElement = selectedElements[0];
        const { selectedCorner } = selectionCoordinates;
        if (selectedElement && selectedCorner !== null) {
          switch (selectionMode.elementType) {
            case ElementType.Diamond:
            case ElementType.Text:
            case ElementType.Rect:
            case ElementType.Ellipse: {
              const el = copy(appState.elements[selectedElement]) as
                | Rect
                | Text
                | Diamond
                | Ellipse;
              const [width, height, x, y] = resizeRect(
                selectedCorner as Corner,
                clientCoordinates.x,
                clientCoordinates.y,
                el
              );
              const changeUpdate = createUpdateChange(
                {
                  ...el,
                  width,
                  height,
                  x,
                  y,
                },
                isEphemeral,
                history.currentUserId
              );
              changeUpdate && history.addLocalChange(changeUpdate);

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
              const overlappingPoint = getOverlappingPoint(
                newX,
                newY,
                Object.values(appState.elements)
              );
              newPoints[pos] = { ...newPoints[pos], ...overlappingPoint };
              history.addLocalChange(
                updatePolylineAction(
                  {
                    ...el,
                    points: newPoints,
                  },
                  isEphemeral,
                  history.currentUserId
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
        const changeAction = createUpdateChange(
          element,
          isEphemeral,
          history.currentUserId
        );
        changeAction && history.addLocalChange(changeAction);
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
        const changeAction = createUpdateChange(
          element,
          isEphemeral,
          history.currentUserId
        );
        changeAction && history.addLocalChange(changeAction);

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
        const changeAction = createUpdateChange(
          element,
          isEphemeral,
          history.currentUserId
        );
        changeAction && history.addLocalChange(changeAction);

        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.TextEditing,
        });
        setSelectedElements([element.id]);

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
        const changeAction = createUpdateChange(
          element,
          isEphemeral,
          history.currentUserId
        );
        changeAction && history.addLocalChange(changeAction);

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
