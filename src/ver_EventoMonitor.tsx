import React, { useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export const VerEventoMonitor: React.FC = () => {
  const [ultimoEvento, setUltimoEvento] = useState<string>("(esperando evento...)");

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    (async () => {
      unlisten = await listen("serial-raw", (event) => {
        const payload = event.payload as string;
        console.log("Evento serial-raw recibido:", payload);
        setUltimoEvento(payload);
      });
    })();

    return () => {
      if (unlisten) {
        unlisten();
        unlisten = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#f9fafb",
        padding: "1rem",
        borderRadius: "8px",
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        border: "1px solid #ddd",
        marginTop: "1rem",
      }}
    >
      <strong>Último evento "serial-raw":</strong>
      <p>{ultimoEvento}</p>
    </div>
  );
};
