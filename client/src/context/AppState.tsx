import React, { createContext, useState, useContext } from "react";
import {
  initialState,
  SelectionCoordinates,
  SelectionModes,
  AppState,
  SelectionMode,
  initialSelectionCoordinates,
  ViewBox,
  initialViewBox,
} from "../types";
import History from "../services/History";
import { useViewBox } from "../hooks/useViewBox";
import { useRoomId as useRoomIdImport } from "../hooks/useRoomId";

interface IAppStateContext {
  appState: AppState;
  history: History;
  selectedElements: string[];
  setSelectedElements: React.Dispatch<React.SetStateAction<string[]>>;
  hoverElement: string | null;
  setHoverElement: React.Dispatch<React.SetStateAction<string | null>>;
  selectionCoordinates: SelectionCoordinates;
  setSelectionCoordinates: React.Dispatch<
    React.SetStateAction<SelectionCoordinates>
  >;
  selectionMode: SelectionMode;
  setSelectionMode: React.Dispatch<React.SetStateAction<SelectionMode>>;
  showDebugger: boolean;
  viewBox: ViewBox;
  setViewBox: React.Dispatch<React.SetStateAction<ViewBox>>;
}

export const AppStateContext = createContext<IAppStateContext>({
  appState: initialState,
  history: null!,
  selectedElements: [],
  setSelectedElements: () => {},
  hoverElement: null,
  setHoverElement: () => {},
  selectionCoordinates: initialSelectionCoordinates,
  setSelectionCoordinates: () => {},
  selectionMode: {
    type: SelectionModes.None,
  },
  setSelectionMode: () => {},
  showDebugger: false,
  viewBox: initialViewBox(window),
  setViewBox: () => {},
});

export const useAppState = () => useContext(AppStateContext);

type AppStateProviderProps = {
  children:
    | boolean
    | JSX.Element
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
  useRoomId?: typeof useRoomIdImport;
};

export const AppStateProvider = ({
  useRoomId = useRoomIdImport,
  children,
}: AppStateProviderProps) => {
  const roomId = useRoomId();
  const [appState, setAppState] = useState<AppState>(initialState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [history] = useState(() => new History(appState, setAppState, roomId));
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [hoverElement, setHoverElement] = useState<string | null>(null);
  const [selectionCoordinates, setSelectionCoordinates] =
    useState<SelectionCoordinates>(initialSelectionCoordinates);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>({
    type: SelectionModes.None,
  });
  const [showDebugger] = useState(false);
  const [viewBox, setViewBox] = useViewBox();

  if (!history) {
    return <p>loading...</p>;
  }

  return (
    <AppStateContext.Provider
      value={{
        appState,
        history,
        selectedElements,
        setSelectedElements,
        hoverElement,
        setHoverElement,
        selectionCoordinates,
        setSelectionCoordinates,
        selectionMode,
        setSelectionMode,
        showDebugger,
        viewBox,
        setViewBox,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
