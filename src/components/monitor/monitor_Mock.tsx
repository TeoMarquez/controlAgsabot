import { useEffect, useState } from "react";
import { useConexionSerial } from "../conexionSerial/conexionSerial_Context";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface Junta {
  nombre: string;
  grados: string;
  potenciometro: string;
}

interface ParserPayload {
  estado: string;
  juntas: Junta[];
}

const nombres = ["Cintura", "Hombro", "Codo", "Muñeca", "Pinza"];

const generarJuntasVacias = (): Junta[] =>
  nombres.map((nombre) => ({
    nombre,
    grados: "-",
    potenciometro: "-",
  }));

export const useMonitorMock = () => {
  const { state } = useConexionSerial();
  const [juntas, setJuntas] = useState<Junta[]>(generarJuntasVacias());

  useEffect(() => {
    if (!state.conectado) {
      setJuntas(generarJuntasVacias());
      return;
    }

    let unlisten: UnlistenFn | null = null;

    (async () => {
      unlisten = await listen("serial-parser", (event) => {
        const payload = event.payload as ParserPayload;
        if (payload?.juntas && payload.juntas.length === 5) {
          setJuntas(payload.juntas);
        }
      });
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, [state.conectado]);

  return { juntas, seleccionado: 0 };
};
