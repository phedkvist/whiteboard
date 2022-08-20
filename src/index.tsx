import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AppStateProvider } from "./context/AppState";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*
  Basic
  ----
  ✅ Drag elements around
  ✅ Add basic elements to canvas (rect, ellipse)
  ✅ Add hover cursor when mouse is over element
  ✅ Add text element to canvas
  ✅ Add element property settings on the left handside
  ✅ Change color of element on canvas
  ✅ Add the ability to place elements above or below other elements
  Select multiple elements with the mouse


  Advanced
  ----
  Handle zooming in/out
  ✅ Handle turning an element around
  ✅ Handle resizing an element
  Add history logs
  Add undo/redo of operations
  Collaboration features
  Snap lines. When moving an element
  ----

  Super advanced
  ----
  Import elements from an image of a real whiteboard

  General improvements
  -----
  ✅ Place the appState into a context, removes prop drilling.
  Make use of classes for different elements, should make it easier to have methods tied to the element.
  ✅ Update the resizing function to take the rotation into account.
*/
