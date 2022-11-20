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
} from "../Types";
import History from "../services/History";

interface IAppStateContext {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  history: History | null;
  selectedElement: string | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<string | null>>;
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
  setAppState: () => {},
  history: null,
  selectedElement: null,
  setSelectedElement: () => {},
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
  const [appState, setAppState] = useState<AppState>(initialState);
  const [history] = useState(() => new History(appState, setAppState));
  // TODO: All changes must go trough the history class

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoverElement, setHoverElement] = useState<string | null>(null);
  const [selectionCoordinates, setSelectionCoordinates] =
    useState<SelectionCoordinates>(initialSelectionCoordinates);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>({
    type: SelectionModes.None,
  });
  const [showDebugger] = useState(true);
  const [viewBox, setViewBox] = useState(initialViewBox);
  // console.log(history);
  return (
    <AppStateContext.Provider
      value={{
        appState,
        setAppState,
        history,
        selectedElement,
        setSelectedElement,
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
