import React, { createContext, useState, useContext, useMemo } from "react";
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
import { getRoomId } from "../helpers/user";

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

export const AppStateProvider = (props: {
  children:
    | boolean
    | JSX.Element
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = getRoomId(searchParams, setSearchParams);
  const [appState, setAppState] = useState<AppState>(initialState);
  const history = useMemo(() => new History(appState, setAppState, roomId), []);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [hoverElement, setHoverElement] = useState<string | null>(null);
  const [selectionCoordinates, setSelectionCoordinates] =
    useState<SelectionCoordinates>(initialSelectionCoordinates);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>({
    type: SelectionModes.None,
  });
  const [showDebugger] = useState(false);
  const [viewBox, setViewBox] = useState(initialViewBox);

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
      {props.children}
    </AppStateContext.Provider>
  );
};
