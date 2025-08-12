import React, { useEffect, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface Junta {
  nombre: string;
  grados: string;
  potenciometro: string;
}

interface EventoParserPayload {
  estado: string;
  juntas: Junta[];
}

export const VerEventoParser: React.FC = () => {
  const [ultimoEvento, setUltimoEvento] = useState<EventoParserPayload | null>(null);

  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    (async () => {
      unlisten = await listen("serial-parser", (event) => {
        const payload = event.payload as EventoParserPayload;
        console.log("Evento serial-parser recibido:", payload);
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
      <strong>Último evento "serial-parser":</strong>
      {ultimoEvento ? (
        <pre>{JSON.stringify(ultimoEvento, null, 2)}</pre>
      ) : (
        <p>(esperando evento...)</p>
      )}
    </div>
  );
};
