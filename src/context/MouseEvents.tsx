import React, {
  createContext,
  MouseEventHandler,
  useContext,
  WheelEventHandler,
} from "react";
import {
  SelectionModes,
  ElementType,
  Rect,
  ElementState,
  Element as WhiteboardElement,
  Ellipse,
  Polyline,
  Text,
} from "../Types";
import {
  getClosestCorner,
  resizeRect,
  resizeEllipse,
  getMidPoints,
  MouseButtons,
} from "../utility";
import { useAppState } from "./AppState";
import { v4 as uuid } from "uuid";

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

const width = 2000;
const height = 1000;

export const MouseEventsProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const {
    appState,
    setAppState,
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

  const onMouseWheel: WheelEventHandler<SVGSVGElement> = (e) => {
    // https://stackoverflow.com/questions/52576376/how-to-zoom-in-on-a-complex-svg-structure
    // e.preventDefault();
    const w = viewBox.w;
    const h = viewBox.h;
    const mx = e.movementX; //mouse x
    const my = e.movementY;
    const dw = w * Math.sign(e.deltaY) * 0.05;
    const dh = h * Math.sign(e.deltaY) * 0.05;
    const dx = (dw * mx) / width;
    const dy = (dh * my) / height;
    const newViewBox = {
      x: viewBox.x + dx,
      y: viewBox.y + dy,
      w: viewBox.w - dw,
      h: viewBox.h - dh,
    };
    const scale = width / viewBox.w;
    // zoomValue.innerText = `${Math.round(scale * 100) / 100}`;
    // svgImage.setAttribute(
    //   "viewBox",
    //   `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`
    // );
    // console.log("SCALE: ", scale);
    // console.log("VIEWBOX: ", viewBox);
    setViewBox({ ...viewBox, ...newViewBox, scale });
    e.stopPropagation();
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
          return;
        }
        const id = e.target.id;
        if (selectedElement !== null && id !== selectedElement) {
          removeSelection();
        }
        const { x: xOffset, y: yOffset } = e.target.getBoundingClientRect();

        setSelectedElement(id);
        setSelectionMode({ ...selectionMode, type: SelectionModes.Selected });

        const initialX = e.clientX - xOffset;
        const initialY = e.clientY - yOffset;
        setSelectionCoordinates({
          ...selectionCoordinates,
          xOffset,
          yOffset,
          initialX,
          initialY,
        });
        break;
      }
      case SelectionModes.Add: {
        const initialX = e.clientX;
        const initialY = e.clientY;
        setSelectionCoordinates({
          ...selectionCoordinates,
          initialX,
          initialY,
        });
        const id = uuid();
        setSelectedElement(id);

        switch (selectionMode.elementType) {
          case ElementType.Rect: {
            const newAppState = Object.assign({}, appState);
            const elementsCount = newAppState.elementsCount + 1;
            const renderingOrder = [...newAppState.renderingOrder, id];

            const newRect: Rect = {
              id,
              type: ElementType.Rect,
              width: 0,
              height: 0,
              x: initialX,
              y: initialY,
              state: ElementState.Creation,
              rotate: 0,
              renderingOrder: elementsCount,
            };
            newAppState.elements[id] = newRect;
            setAppState({ ...newAppState, elementsCount, renderingOrder });
            break;
          }
          case ElementType.Ellipse: {
            const newAppState = Object.assign({}, appState);
            const elementsCount = newAppState.elementsCount + 1;
            const renderingOrder = [...newAppState.renderingOrder, id];

            const newCircle: Ellipse = {
              id,
              type: ElementType.Ellipse,
              rx: 0,
              ry: 0,
              cx: initialX,
              cy: initialY,
              state: ElementState.Creation,
              rotate: 0,
              renderingOrder: elementsCount,
            };
            newAppState.elements[id] = newCircle;
            setAppState({ ...newAppState, elementsCount, renderingOrder });
            break;
          }
          case ElementType.Text: {
            const newAppState = Object.assign({}, appState);
            const elementsCount = newAppState.elementsCount + 1;
            const renderingOrder = [...newAppState.renderingOrder, id];

            const newText: Text = {
              id,
              type: ElementType.Text,
              x: initialX,
              y: initialY,
              text: "Text",
              state: ElementState.Creation,
              style: { fontSize: "14px", color: "black" },
              rotate: 0,
              renderingOrder: elementsCount,
            };
            newAppState.elements[id] = newText;
            setAppState({ ...newAppState, elementsCount, renderingOrder });
            break;
          }
          case ElementType.Polyline: {
            // We start and end the polyline creation here.
            const newAppState = Object.assign({}, appState);

            if (selectedElement) {
              // Second part of drawing the line.
              const creationElement = appState.elements[selectedElement];
              if (creationElement.type !== ElementType.Polyline) {
                throw new Error(
                  "Expected selected element to be a polyline element"
                );
              }
              creationElement.state = ElementState.Visible;
              newAppState.elements[selectedElement] = creationElement;

              setAppState(newAppState);
              // Need to handle it being selected but not in selection mode which drags elements around?
              setSelectionMode({
                ...selectionMode,
                type: SelectionModes.None,
              });
              setSelectedElement(null);
              setAppState(newAppState);
            } else {
              const elementsCount = newAppState.elementsCount + 1;
              const renderingOrder = [...newAppState.renderingOrder, id];

              const newPolyline: Polyline = {
                id,
                type: ElementType.Polyline,
                points: [initialX, initialY],
                rotate: 0,
                stroke: "black",
                state: ElementState.Creation,
                strokeWidth: "4px",
                renderingOrder: elementsCount,
              };
              newAppState.elements[id] = newPolyline;
              setAppState({ ...newAppState, elementsCount, renderingOrder });
            }
            break;
          }
        }
        break;
      }
      case SelectionModes.Selected: {
        if (!(e.target instanceof Element) || e.target.id === "container") {
          setSelectionMode({ ...selectionMode, type: SelectionModes.None });
          setSelectedElement(null);
          return;
        }
        if (e.target.id.includes("resize")) {
          // TODO: Might need to add elementType below as well :)
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
          const initialX = e.clientX;
          const initialY = e.clientY;
          if (!selectedElement) return;
          const element = appState.elements[selectedElement];
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
        } else if (e.target.id.includes("rotate")) {
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
        } else {
          const id = e.target.id;
          if (selectedElement !== null && id !== selectedElement) {
            removeSelection();
          }
          const { x: xOffset, y: yOffset } = e.target.getBoundingClientRect();
          setSelectedElement(id);
          const { scale } = viewBox;

          console.log(e.clientX, e.clientY);
          const initialX = (e.clientX - xOffset) / scale;
          const initialY = (e.clientY - yOffset) / scale;
          const originElement = JSON.parse(
            JSON.stringify(appState.elements[id])
          );
          setSelectionCoordinates({
            ...selectionCoordinates,
            xOffset: xOffset / scale,
            yOffset: yOffset / scale,
            initialX,
            initialY,
            startX: e.clientX / scale,
            startY: e.clientY / scale,
            originElement,
          });
        }
        break;
      }
    }
  };

  const onMouseMove: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== MouseButtons.LEFT) return;

    switch (selectionMode.type) {
      case SelectionModes.Selected: {
        const { initialX, initialY, startX, startY, originElement } =
          selectionCoordinates;
        if (
          selectedElement &&
          initialX &&
          initialY &&
          startX &&
          startY &&
          originElement
        ) {
          e.preventDefault();
          const { scale } = viewBox;

          const currentX = e.clientX / scale - initialX;
          const currentY = e.clientY / scale - initialY;
          const xOffset = currentX;
          const yOffset = currentY;
          const diffX = e.clientX / scale - startX;
          const diffY = e.clientY / scale - startY;

          setElementCoords(
            selectedElement,
            currentX,
            currentY,
            diffX,
            diffY,
            originElement
          );
          setSelectionCoordinates({
            ...selectionCoordinates,
            xOffset,
            yOffset,
          });
        }
        break;
      }
      case SelectionModes.Add: {
        if (!selectedElement) return;
        const newAppState = Object.assign({}, appState);
        const creationElement = Object.assign(
          {},
          newAppState.elements[selectedElement]
        );
        if (creationElement.type === "rect") {
          creationElement.width = e.clientX - creationElement.x;
          creationElement.height = e.clientY - creationElement.y;
        } else if (creationElement.type === "ellipse") {
          // const radius =
          const { initialX, initialY } = selectionCoordinates;
          if (!(initialX && initialY)) return;
          creationElement.rx = (e.clientX - initialX) / 2;
          creationElement.ry = (e.clientY - initialY) / 2;
          creationElement.cx = initialX + creationElement.rx;
          creationElement.cy = initialY + creationElement.ry;
        } else if (creationElement.type === "polyline") {
          const newPoints = [
            creationElement.points[0],
            creationElement.points[1],
            e.clientX,
            e.clientY,
          ];
          creationElement.points = newPoints;
        }
        creationElement.state = ElementState.Creation;
        newAppState.elements[selectedElement] = creationElement;
        setAppState(newAppState);
        break;
      }
      case SelectionModes.Resizing: {
        e.preventDefault();

        const { selectedCorner } = selectionCoordinates;
        if (selectedElement && selectedCorner) {
          switch (selectionMode.elementType) {
            case ElementType.Rect: {
              const el = appState.elements[selectedElement];
              if (el.type !== "rect") return;
              const [newWidth, newHeight, newX, newY] = resizeRect(
                selectedCorner,
                e.clientX,
                e.clientY,
                el
              );
              setElementSize(selectedElement, newWidth, newHeight, newX, newY);
              break;
            }
            case ElementType.Ellipse: {
              const obj = appState.elements[selectedElement];
              if (!obj || obj.type !== ElementType.Ellipse) return;
              const [newWidth, newHeight, newCX, newCY] = resizeEllipse(
                selectedCorner,
                e.clientX,
                e.clientY,
                obj
              );
              setElementSize(
                selectedElement,
                newWidth,
                newHeight,
                newCX,
                newCY
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
        const { initialX, initialY, initialWidth, initialHeight } =
          selectionCoordinates;
        if (
          !(
            initialX &&
            initialY &&
            initialWidth &&
            initialHeight &&
            selectedElement
          )
        )
          return;
        const { clientX, clientY } = e;
        const element = appState.elements[selectedElement];
        const [midX, midY] = getMidPoints(element);
        const deltaX = clientX - midX;
        const deltaY = clientY - midY;
        const theta = Math.round(
          (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90
        );
        const newElement = Object.assign({}, element);
        newElement.rotate = theta;
        const newAppState = Object.assign({}, appState);
        newAppState.elements[selectedElement] = newElement;
        setAppState(newAppState);
      }
    }
  };

  const onMouseUp: MouseEventHandler<SVGSVGElement> = (e) => {
    if (e.button !== MouseButtons.LEFT) return;

    // On mouse up add the element to the screen
    switch (selectionMode.type) {
      case SelectionModes.Selected: {
        const initialX = selectionCoordinates.currentX;
        const initialY = selectionCoordinates.currentY;
        setSelectionCoordinates({
          ...selectionCoordinates,
          initialX,
          initialY,
        });
        break;
      }
      case SelectionModes.Add: {
        // Record selection elements and draw the element directly but with faded bg?
        if (!selectedElement) return;
        const newAppState = Object.assign({}, appState);
        const creationElement = Object.assign(
          {},
          newAppState.elements[selectedElement]
        );
        if (creationElement.type === "rect") {
          creationElement.width = e.clientX - creationElement.x;
          creationElement.height = e.clientY - creationElement.y;
        } else if (creationElement.type === "ellipse") {
          const { initialX, initialY } = selectionCoordinates;
          if (!(initialX && initialY)) return;
          creationElement.rx = (e.clientX - initialX) / 2;
          creationElement.ry = (e.clientY - initialY) / 2;
          creationElement.cx = initialX + creationElement.rx;
          creationElement.cy = initialY + creationElement.ry;
        } else if (creationElement.type === "text") {
          creationElement.x = e.clientX;
          creationElement.y = e.clientY;
        } else if (creationElement.type === "polyline") {
          break;
        }
        creationElement.state = ElementState.Visible;
        newAppState.elements[selectedElement] = creationElement;
        setAppState(newAppState);
        // Need to handle it being selected but not in selection mode which drags elements around?
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

        setSelectionMode({
          ...selectionMode,
          type: SelectionModes.None,
        });
        setSelectedElement(null);
        break;
      }
    }
  };

  const setElementCoords = (
    id: string,
    x: number,
    y: number,
    diffX: number,
    diffY: number,
    originElement: WhiteboardElement
  ) => {
    const newAppState = Object.assign({}, appState);
    const obj = newAppState.elements[id];
    if (!obj) {
      throw new Error(`Can't find element with id: ${id} on the screen.`);
    }
    if (obj.type === "ellipse") {
      // CX is center of circle, hence add radius since incoming xy coords are top left
      obj.cx = x + obj.rx;
      obj.cy = y + obj.ry;
    } else if (obj.type === "rect" || obj.type === "text") {
      obj.x = x;
      obj.y = y;
    } else if (obj.type === "polyline" && originElement.type === "polyline") {
      const newPoints = originElement.points.map((v, i) =>
        i % 2 === 0 || i === 0 ? v + diffX : v + diffY
      );
      obj.points = newPoints;
    } else {
      throw new Error("Something went wrong in set element coords");
    }
    newAppState.elements = { ...newAppState.elements, [id]: obj };
    setAppState(newAppState);
  };

  const setElementSize = (
    id: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) => {
    const newAppState = Object.assign({}, appState);
    const obj = newAppState.elements[id];
    if (!obj) {
      throw new Error(`Can't find element with id: ${id} on the screen.`);
    }
    if (width < 5 || height < 5) {
      console.warn(`Height or width can't be lower than 5`);
      return;
    }
    if (obj.type === "ellipse") {
      obj.rx = width / 2;
      obj.ry = height / 2;
      // The cx and cy needs to updated
      if (x) obj.cx = x;
      if (y) obj.cy = y;
    } else if (obj.type === "rect") {
      obj.width = width;
      obj.height = height;
      if (x) obj.x = x;
      if (y) obj.y = y;
    }
    newAppState.elements = { ...newAppState.elements, [id]: obj };
    setAppState(newAppState);
  };

  const removeSelection = () => {
    setSelectedElement(null);
  };
  return (
    <MouseEventsContext.Provider
      value={{ onMouseOver, onMouseDown, onMouseMove, onMouseUp, onMouseWheel }}
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
