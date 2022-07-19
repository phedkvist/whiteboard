import {
  LegacyRef,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import "./App.css";
import Canvas, { CanvasState } from "./components/Canvas";
import Edit from "./components/Edit";
import Toolbar from "./components/Toolbar";

const initialState: CanvasState = {
  elements: {
    "1": {
      id: "1",
      type: "circle",
      cx: 50,
      cy: 50,
      r: 50,
      style: { fill: "red" },
    },
    "2": {
      id: "2",
      type: "rect",
      width: 100,
      height: 100,
      x: 200,
      y: 200,
      style: { fill: "blue" },
    },
  },
};

interface SelectionCoordinates {
  currentX: null | number;
  currentY: null | number;
  initialX: null | number;
  initialY: null | number;
  xOffset: number;
  yOffset: number;
}

function App() {
  const [appState, setAppState] = useState<CanvasState>(initialState);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectionCoordinates, setSelectionCoordinates] =
    useState<SelectionCoordinates>({
      currentX: null,
      currentY: null,
      initialX: null,
      initialY: null,
      xOffset: 0,
      yOffset: 0,
    });
  const containerRef = useRef<SVGSVGElement>(null);

  const dragStart: MouseEventHandler<SVGSVGElement> = (e) => {
    const { xOffset, yOffset } = selectionCoordinates;

    const initialX = e.clientX - xOffset;
    const initialY = e.clientY - yOffset;
    setSelectionCoordinates({ ...selectionCoordinates, initialX, initialY });
  };

  const dragEnd: MouseEventHandler<SVGSVGElement> = (e) => {
    const initialX = selectionCoordinates.currentX;
    const initialY = selectionCoordinates.currentY;
    setSelectionCoordinates({ ...selectionCoordinates, initialX, initialY });
  };

  const drag: MouseEventHandler<SVGSVGElement> = (e) => {
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
  };

  const setElementCoords = (id: string, x: number, y: number) => {
    const newAppState = Object.assign({}, appState);
    const obj = newAppState.elements[id];
    if (obj.type === "circle") {
      // CX is center of circle, hence add radius since incoming xy coords are top left
      obj.cx = x + obj.r;
      obj.cy = y + obj.r;
    } else if (obj.type === "rect") {
      obj.x = x;
      obj.y = y;
    }
    newAppState.elements = { ...newAppState.elements, [id]: obj };
    setAppState(newAppState);
  };

  const setSelectedBorder = (id: string, style: any) => {
    const newAppState = Object.assign({}, appState);
    const obj = newAppState.elements[id];
    obj.style = {
      ...obj.style,
      ...style,
    };
    newAppState.elements = { ...newAppState.elements, [id]: obj };
    setAppState(newAppState);
  };

  const removeSelection = () => {
    selectedElement &&
      setSelectedBorder(selectedElement, {
        stroke: "pink",
        strokeWidth: "0",
        fillOpacity: "1",
      });
    setSelectedElement(null);
  };

  const onClick = (e: React.MouseEvent<SVGElement>) => {
    if (!(e.target instanceof Element) || e.target.id === "container") {
      removeSelection();
      return;
    }
    const id = e.target.id;
    if (selectedElement !== null && id !== selectedElement) {
      removeSelection();
    }
    const { x: xOffset, y: yOffset } = e.target.getBoundingClientRect();
    setSelectionCoordinates({
      ...selectionCoordinates,
      xOffset,
      yOffset,
    });
    setSelectedElement(id);
    setSelectedBorder(id, {
      stroke: "pink",
      strokeWidth: "5",
      fillOpacity: "0.8",
    });
  };
  return (
    <div className="App">
      {/*<Toolbar /> TODO: Make the canvas absolute start at top left corner */}
      <Canvas
        containerRef={containerRef}
        canvasState={appState}
        onClick={onClick}
        onMouseDown={dragStart}
        onMouseUp={dragEnd}
        onMouseMove={drag}
      />
      <Edit />
    </div>
  );
}

export default App;
