import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { useWindowFocus } from "../hooks/useWindowFocus";

export interface LogEntry {
  timestamp: string;
  message: string;
}

const MAX_DISPLAY = 100;

export function useMockRecibidos() {
  const [mensajesRecibidos, setMensajesRecibidos] = useState<LogEntry[]>([]);
  const focused = useWindowFocus();
  const focusedRef = useRef<boolean>(true);
  const bufferRef = useRef<LogEntry[]>([]);

  // Mantener siempre el valor más reciente
  focusedRef.current = focused;

  useEffect(() => {
    let segundos = 5;
    let millis = 0;
    let unlisten: () => void;

    (async () => {
      unlisten = await listen("serial-raw", (event) => {
        const mensajeRaw = event.payload as string;

        millis += 10;
        if (millis >= 100) {
          segundos += 1;
          millis = 0;
        }

        const timestamp = `00:00:${segundos.toString().padStart(2, "0")}.${millis.toString().padStart(2, "0")}`;
        bufferRef.current.push({ timestamp, message: mensajeRaw });

        if (bufferRef.current.length > MAX_DISPLAY) {
          bufferRef.current = bufferRef.current.slice(-MAX_DISPLAY);
        }

        // actualizar React solo si la ventana está enfocada
        if (focusedRef.current) {
          setMensajesRecibidos([...bufferRef.current]);
        }
      });
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  return mensajesRecibidos;
}
