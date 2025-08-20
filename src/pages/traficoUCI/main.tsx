// src/pages/traficoUCI/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import TraficoUCIWrapper from "./context/traficoUCIWrapper";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TraficoUCIWrapper />
  </React.StrictMode>
);
