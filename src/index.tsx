import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
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
  Add element property settings on the left handside
  Change color of element on canvas


  Advanced
  ----
  Handle zooming in/out
  Handle turning an element around
  Handle resizing an element
  Add history logs
  Add undo/redo of operations
  Collaboration features
  ----
*/
