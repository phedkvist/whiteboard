import { v4 as uuid } from "uuid";
import { MouseEventHandler, useRef, useState } from "react";
import "./App.css";
import Canvas from "./components/Canvas";
import Edit from "./components/Edit";
import Toolbar from "./components/Toolbar";
import {
  initialState,
  SelectionCoordinates,
  SelectionModes,
  SelectionMode,
  CanvasState,
  ElementType,
  Rect,
  ElementState,
  Ellipse,
  Text,
  Corner,
} from "./Types";
import { Properties } from "./components/Properties";
import { getClosestCorner } from "./utility";
import { Debugger } from "./components/Debugger/Debugger";

const SHOW_DEBUGGER = true;

function App() {
  const [appState, setAppState] = useState<CanvasState>(initialState);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoverElement, setHoverElement] = useState<string | null>(null);
  const [selectionCoordinates, setSelectionCoordinates] =
    useState<SelectionCoordinates>({
      currentX: null,
      currentY: null,
      initialX: null,
      initialY: null,
      initialHeight: null,
      initialWidth: null,
      xOffset: 0,
      yOffset: 0,
      selectedCorner: null,
    });
  const [selectionMode, setSelectionMode] = useState<SelectionMode>({
    type: SelectionModes.None,
  });

  const containerRef = useRef<SVGSVGElement>(null);

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
        // should get elementType here.
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
            };
            const newAppState = Object.assign({}, appState);
            newAppState.elements[id] = newRect;
            setAppState(newAppState);
            break;
          }
          case ElementType.Ellipse: {
            // Implement
            const newCircle: Ellipse = {
              id,
              type: ElementType.Ellipse,
              rx: 0,
              ry: 0,
              cx: initialX,
              cy: initialY,
              state: ElementState.Creation,
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
        // If pressing down on a resize element.
        // start capturing the movements which should update the size
        // Could set selection mode to resizing if this is the case.

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
        // Get the selection coordinates and add element
        // If element size is too small, skip adding it
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
        // Resize the given element according to how the mouse moves
        // Need to know which corner we have selected.
        // This will then be used to know how to resize the element.

        /*
          Bottom left: calc diff and update width and height
          Others: update x,y and width and height
        */
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
          initialHeight
        ) {
          switch (selectionMode.elementType) {
            case ElementType.Rect: {
              if (selectedCorner === Corner.BottomRight) {
                const newWidth = initialWidth + e.clientX - initialX;
                const newHeight = initialHeight + e.clientY - initialY;
                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  null,
                  null
                );
              } else if (selectedCorner === Corner.BottomLeft) {
                const newWidth = initialWidth - (e.clientX - initialX);
                const newHeight = initialHeight + e.clientY - initialY;
                const newX = e.clientX;
                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  newX,
                  null
                );
              } else if (selectedCorner === Corner.TopRight) {
                const newWidth = initialWidth + e.clientX - initialX;
                const newHeight = initialHeight - (e.clientY - initialY);
                const newY = e.clientY;
                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  null,
                  newY
                );
              } else if (selectedCorner === Corner.TopLeft) {
                const newWidth = initialWidth - (e.clientX - initialX);
                const newHeight = initialHeight - (e.clientY - initialY);
                const newX = e.clientX;
                const newY = e.clientY;
                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  newX,
                  newY
                );
              }
              break;
            }
            case ElementType.Ellipse: {
              const obj = appState.elements[selectedElement];
              if (!obj || obj.type !== ElementType.Ellipse) return;
              if (selectedCorner === Corner.BottomRight) {
                console.log("X,Y Offset: ", xOffset, yOffset);
                const newWidth = initialWidth + e.clientX - initialX;
                const newHeight = initialHeight + e.clientY - initialY;
                // Calc old topLeft corner. Then find new cx by adding the new rx to old topLeft corner.
                const newCX = xOffset + newWidth / 2;
                const newCY = yOffset + newHeight / 2;

                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  newCX,
                  newCY
                );
              } else if (selectedCorner === Corner.BottomLeft) {
                const newWidth = initialWidth - (e.clientX - initialX);
                const newHeight = initialHeight + e.clientY - initialY;
                // Calc topRight corner by
                const newCX = e.clientX + newWidth / 2;
                const newCY = e.clientY - newHeight / 2;
                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  newCX,
                  newCY
                );
              } else if (selectedCorner === Corner.TopRight) {
                const newWidth = initialWidth + e.clientX - initialX;
                const newHeight = initialHeight - (e.clientY - initialY);
                const newCX = xOffset + newWidth / 2;
                const newCY = e.clientY + newHeight / 2;
                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  newCX,
                  newCY
                );
              } else if (selectedCorner === Corner.TopLeft) {
                const newWidth = initialWidth - (e.clientX - initialX);
                const newHeight = initialHeight - (e.clientY - initialY);
                const newCX = e.clientX + newWidth / 2;
                const newCY = e.clientY + newHeight / 2;
                setElementSize(
                  selectedElement,
                  newWidth,
                  newHeight,
                  newCX,
                  newCY
                );
              }
              break;
            }
          }
        }

        break;
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
      <Toolbar
        setSelectedElement={setSelectedElement}
        selectionMode={selectionMode}
        setSelectionMode={setSelectionMode}
      />
      <Properties
        selectionMode={selectionMode}
        appState={appState}
        selectedElement={selectedElement}
        setAppState={setAppState}
      />
      <Canvas
        containerRef={containerRef}
        selectedElement={selectedElement}
        hoverElement={hoverElement}
        selectionMode={selectionMode}
        canvasState={appState}
        onMouseOver={onMouseOver}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      />
      <Edit />
      {SHOW_DEBUGGER && (
        <Debugger
          selectionCoordinates={selectionCoordinates}
          selectionMode={selectionMode}
          selectedElement={selectedElement}
        />
      )}
    </div>
  );
}

export default App;
