import { v4 as uuid } from "uuid";
import { MouseEventHandler } from "react";
import "./App.css";
import Canvas from "./components/Canvas";
import Edit from "./components/Edit";
import Toolbar from "./components/Toolbar";
import {
  SelectionModes,
  ElementType,
  Rect,
  ElementState,
  Ellipse,
  Text,
} from "./Types";
import { Properties } from "./components/Properties";
import {
  getClosestCorner,
  getMidPoints,
  resizeEllipse,
  resizeRect,
} from "./utility";
import { Debugger } from "./components/Debugger";
import { useAppState } from "./context/AppState";

const SHOW_DEBUGGER = true;

function App() {
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
  } = useAppState();

  const onMouseOver: MouseEventHandler<SVGSVGElement> = (e) => {
    if (!(e.target instanceof Element) || e.target.id === "container") {
      setHoverElement(null);
      return;
    }
    setHoverElement(e.target.id);
  };

  const onMouseDown: MouseEventHandler<SVGSVGElement> = (e) => {
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
            const newRect: Rect = {
              id,
              type: ElementType.Rect,
              width: 0,
              height: 0,
              x: initialX,
              y: initialY,
              state: ElementState.Creation,
              rotate: 0,
            };
            const newAppState = Object.assign({}, appState);
            newAppState.elements[id] = newRect;
            setAppState(newAppState);
            break;
          }
          case ElementType.Ellipse: {
            const newCircle: Ellipse = {
              id,
              type: ElementType.Ellipse,
              rx: 0,
              ry: 0,
              cx: initialX,
              cy: initialY,
              state: ElementState.Creation,
              rotate: 0,
            };
            const newAppState = Object.assign({}, appState);
            newAppState.elements[id] = newCircle;
            setAppState(newAppState);
            break;
          }
          case ElementType.Text: {
            const newText: Text = {
              id,
              type: ElementType.Text,
              x: initialX,
              y: initialY,
              text: "Text",
              state: ElementState.Creation,
              style: { fontSize: "14px", color: "black" },
              rotate: 0,
            };
            const newAppState = Object.assign({}, appState);
            newAppState.elements[id] = newText;
            setAppState(newAppState);
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
          console.log("SELECTED CORNER: ", selectedCorner);
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
          const initialX = e.clientX - xOffset;
          const initialY = e.clientY - yOffset;
          setSelectionCoordinates({
            ...selectionCoordinates,
            xOffset,
            yOffset,
            initialX,
            initialY,
          });
        }
        break;
      }
    }
  };

  const onMouseMove: MouseEventHandler<SVGSVGElement> = (e) => {
    switch (selectionMode.type) {
      case SelectionModes.Selected: {
        const { initialX, initialY } = selectionCoordinates;
        if (selectedElement && initialX && initialY) {
          e.preventDefault();

          const currentX = e.clientX - initialX;
          const currentY = e.clientY - initialY;
          const xOffset = currentX;
          const yOffset = currentY;

          setElementCoords(selectedElement, currentX, currentY);
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
          creationElement.rx = e.clientX - initialX;
          creationElement.ry = e.clientY - initialY;
          creationElement.cx = initialX + creationElement.rx;
          creationElement.cy = initialY + creationElement.ry;
        }
        creationElement.state = ElementState.Creation;
        newAppState.elements[selectedElement] = creationElement;
        setAppState(newAppState);
        break;
      }
      case SelectionModes.Resizing: {
        e.preventDefault();

        const {
          xOffset,
          yOffset,
          initialX,
          initialY,
          initialWidth,
          initialHeight,
          selectedCorner,
        } = selectionCoordinates;
        if (
          selectedElement &&
          initialX &&
          initialY &&
          initialWidth &&
          initialHeight &&
          selectedCorner
        ) {
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
                xOffset,
                yOffset,
                initialWidth,
                initialHeight,
                initialX,
                initialY,
                e.clientX,
                e.clientY
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
        const theta = (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90;
        const newElement = Object.assign({}, element);
        newElement.rotate = theta;
        const newAppState = Object.assign({}, appState);
        newAppState.elements[selectedElement] = newElement;
        setAppState(newAppState);
      }
    }
  };

  const onMouseUp: MouseEventHandler<SVGSVGElement> = (e) => {
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
          // Make sure the cx and cy are set correctly
          // initialX = e.clientX - 2 * creationElement.cx;
          // initialY = e.clientY - 2 * creationElement.cy;
          const { initialX, initialY } = selectionCoordinates;
          if (!(initialX && initialY)) return;
          creationElement.rx = e.clientX - initialX;
          creationElement.ry = e.clientY - initialY;
          creationElement.cx = initialX + creationElement.rx;
          creationElement.cy = initialY + creationElement.ry;
        } else if (creationElement.type === "text") {
          creationElement.x = e.clientX;
          creationElement.y = e.clientY;
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

  const setElementCoords = (id: string, x: number, y: number) => {
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
    }
    newAppState.elements = { ...newAppState.elements, [id]: obj };
    setAppState(newAppState);
  };

  const setElementSize = (
    id: string,
    width: number,
    height: number,
    x: number | null,
    y: number | null
  ) => {
    const newAppState = Object.assign({}, appState);
    const obj = newAppState.elements[id];
    if (!obj) {
      throw new Error(`Can't find element with id: ${id} on the screen.`);
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
    <div className="App">
      <Toolbar />
      <Properties />
      <Canvas
        onMouseOver={onMouseOver}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      />
      <Edit />
      {SHOW_DEBUGGER && <Debugger />}
    </div>
  );
}

export default App;
