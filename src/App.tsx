import { useState } from "react";
import "./App.css";
import Canvas, { CanvasState } from "./components/Canvas";
import Edit from "./components/Edit";
import Toolbar from "./components/Toolbar";

function App() {
  const [appState, setAppState] = useState<CanvasState>({
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
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);

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

  const onClick = (e: React.MouseEvent<SVGElement>) => {
    console.log("Clicked on: ", e.currentTarget.id);
    const { id } = e.currentTarget;
    if (selectedElement && id !== selectedElement) {
      setSelectedBorder(selectedElement, {
        stroke: "pink",
        strokeWidth: "0",
        fillOpacity: "1",
      });
    }
    setSelectedElement(id);
    setSelectedBorder(id, {
      stroke: "pink",
      strokeWidth: "5",
      fillOpacity: "0.8",
    });
  };
  return (
    <div className="App">
      <Toolbar />
      <Canvas canvasState={appState} onClick={onClick} />
      <Edit />
    </div>
  );
}

export default App;
