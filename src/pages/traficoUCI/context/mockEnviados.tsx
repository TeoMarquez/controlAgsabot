import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";

export interface LogEntry {
  timestamp: string;
  message: string;
}

const MAX_DISPLAY = 100;
const UPDATE_INTERVAL = 100; // ms

export function useEnviados() {
  const [mensajes, setMensajes] = useState<LogEntry[]>([]);
  const bufferRef = useRef<LogEntry[]>([]);

  useEffect(() => {
    let segundos = 0;
    let millis = 0;
    let unlisten: (() => void) | undefined;

    // Escucha eventos serial-sent
    listen<string>("serial-sent", (event) => {
      const mensajeRaw = event.payload;

      millis += 10;
      if (millis >= 100) {
        segundos += 1;
        millis = 0;
      }

      // evitar duplicados consecutivos
      if (bufferRef.current.length > 0) {
        const ultimo = bufferRef.current[bufferRef.current.length - 1];
        if (ultimo.message === mensajeRaw) return; 
      }

      const timestamp = `00:00:${segundos.toString().padStart(2, "0")}.${millis.toString().padStart(2, "0")}`;
      bufferRef.current.push({ timestamp, message: mensajeRaw });

      if (bufferRef.current.length > MAX_DISPLAY) {
        bufferRef.current = bufferRef.current.slice(-MAX_DISPLAY);
      }
    }).then((f) => {
      unlisten = f;
    });

    const interval = setInterval(() => {
      setMensajes([...bufferRef.current]);
    }, UPDATE_INTERVAL);

    return () => {
      if (unlisten) unlisten();
      clearInterval(interval);
      };
  }, []);
  
  return mensajes; 
}
