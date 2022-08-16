import "./App.css";
import Canvas from "./components/Canvas";
import Edit from "./components/Edit";
import Toolbar from "./components/Toolbar";
import { Properties } from "./components/Properties";
import { Debugger } from "./components/Debugger";
import { useAppState } from "./context/AppState";
import { MouseEventsProvider } from "./context/MouseEvents";

function App() {
  const { showDebugger } = useAppState();

  return (
    <div className="App">
      <Toolbar />
      <Properties />
      <MouseEventsProvider>
        <Canvas />
      </MouseEventsProvider>

      <Edit />
      {showDebugger && <Debugger />}
    </div>
  );
}

export default App;
