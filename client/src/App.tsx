import "./App.css";
import Canvas from "./components/Canvas/Canvas";
import Edit from "./components/Edit/Edit";
import Toolbar from "./components/Toolbar/Toolbar";
import { Properties } from "./components/Properties/Properties";
import { Debugger } from "./components/Debugger/Debugger";
import { MouseEventsProvider } from "./context/MouseEvents/MouseEvents";
import ContextMenu from "./components/ContextMenu/ContextMenu";
import { AppStateProvider } from "./context/AppState";
import { getRoomId as getRoomIdImport } from "./helpers/user";

function App({ getRoomId }: { getRoomId?: typeof getRoomIdImport }) {
  return (
    <div className="App">
      <AppStateProvider getRoomId={getRoomId}>
        <Toolbar />
        <Properties />
        <MouseEventsProvider>
          <Canvas />
        </MouseEventsProvider>
        <Edit />
        <Debugger />
        <ContextMenu />
      </AppStateProvider>
    </div>
  );
}

export default App;
