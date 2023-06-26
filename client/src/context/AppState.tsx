import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";
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
import { useSearchParams } from "react-router-dom";
import { getRoomId as getRoomIdImport } from "../helpers/user";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { useViewBox } from "../hooks/useViewBox";

interface IAppStateContext {
  appState: AppState;
  history: History | null;
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
  history: null,
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
  viewBox: initialViewBox,
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
  getRoomId?: typeof getRoomIdImport;
};

export const AppStateProvider = ({
  getRoomId = getRoomIdImport,
  children,
}: AppStateProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = getRoomId(searchParams, setSearchParams);
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
