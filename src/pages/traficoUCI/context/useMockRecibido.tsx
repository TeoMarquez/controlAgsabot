// src/pages/traficoUCI/useMockRecibidos.ts
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import type { LogEntry } from "./mockEnviados"; // o define acá mismo si preferís

export function useMockRecibidos() {
  const [mensajesRecibidos, setMensajesRecibidos] = useState<LogEntry[]>([]);

  useEffect(() => {
    let segundos = 5;
    let millis = 0;

    const unlistenPromise = listen("serial-raw", (event) => {
      const mensajeRaw = event.payload as string;

      millis += 10;
      if (millis >= 100) {
        segundos += 1;
        millis = 0;
      }

      const timestamp = `00:00:${segundos.toString().padStart(2, "0")}.${millis.toString().padStart(2, "0")}`;

      setMensajesRecibidos((prev) => [...prev, { timestamp, message: mensajeRaw }]);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return mensajesRecibidos;
}
