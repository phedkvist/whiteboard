import "./App.css";
import Canvas from "./components/Canvas";
import Edit from "./components/Edit";
import Toolbar from "./components/Toolbar";
import { Properties } from "./components/Properties";
import { Debugger } from "./components/Debugger";
import { MouseEventsProvider } from "./context/MouseEvents";
import ContextMenu from "./components/ContextMenu";

function App() {
  return (
    <div className="App">
      <Toolbar />
      <Properties />
      <MouseEventsProvider>
        <Canvas />
      </MouseEventsProvider>
      <Edit />
      <Debugger />
      <ContextMenu />
    </div>
  );
}

export default App;
