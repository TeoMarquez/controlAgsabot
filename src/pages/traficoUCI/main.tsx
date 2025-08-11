// src/pages/traficoUCI/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import TraficoUCI from "./TraficoUCI";
import { mensajesEnviados, mensajesRecibidos } from "./context/traficoUCI_Mock";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TraficoUCI enviados={mensajesEnviados} recibidos={mensajesRecibidos} />
  </React.StrictMode>
);
