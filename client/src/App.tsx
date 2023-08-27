import "./App.css";
import Canvas from "./components/Canvas/Canvas";
import Edit from "./components/Edit/Edit";
import Toolbar from "./components/Toolbar/Toolbar";
import { Properties } from "./components/Properties/Properties";
import { Debugger } from "./components/Debugger/Debugger";
import { MouseEventsProvider } from "./context/MouseEvents/MouseEvents";
import ContextMenu from "./components/ContextMenu/ContextMenu";
import { AppStateProvider } from "./context/AppState";
import { useRoomId as useRoomIdImport } from "./hooks/useRoomId";

function App({ useRoomId }: { useRoomId?: typeof useRoomIdImport }) {
  return (
    <div className="App">
      <AppStateProvider useRoomId={useRoomId}>
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
