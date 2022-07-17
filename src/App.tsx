import "./App.css";
import Canvas from "./components/Canvas";
import Edit from "./components/Edit";
import Toolbar from "./components/Toolbar";

function App() {
  return (
    <div className="App">
      <Toolbar />
      <Canvas
        canvasState={{
          elements: {
            "1": {
              type: "circle",
              cx: 50,
              cy: 50,
              r: 50,
              style: { fill: "red" },
            },
            "2": {
              type: "rect",
              width: 100,
              height: 100,
              x: 200,
              y: 200,
              style: { fill: "blue" },
            },
          },
        }}
      />
      <Edit />
    </div>
  );
}

export default App;
