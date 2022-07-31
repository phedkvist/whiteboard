import React, { createContext, useState, useContext } from "react";
import {
  initialState,
  SelectionCoordinates,
  SelectionModes,
  AppState,
  SelectionMode,
  initialSelectionCoordinates,
} from "../Types";

interface IAppStateContext {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
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
}

export const AppStateContext = createContext<IAppStateContext>({
  appState: initialState,
  setAppState: () => {},
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
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoverElement, setHoverElement] = useState<string | null>(null);
  const [selectionCoordinates, setSelectionCoordinates] =
    useState<SelectionCoordinates>(initialSelectionCoordinates);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>({
    type: SelectionModes.None,
  });

  return (
    <AppStateContext.Provider
      value={{
        appState,
        setAppState,
        selectedElement,
        setSelectedElement,
        hoverElement,
        setHoverElement,
        selectionCoordinates,
        setSelectionCoordinates,
        selectionMode,
        setSelectionMode,
      }}
    >
      {props.children}
    </AppStateContext.Provider>
  );
};
