// monitor_Mock.ts
import { useEffect, useState } from "react";
import { useConexionSerial } from "../conexionSerial/conexionSerial_Context";

interface Junta {
  nombre: string;
  grados: string;
  potenciometro: string;
}

const nombres = ["Cintura", "Hombro", "Codo", "Muñeca", "Pinza"];

const generarJuntasAleatorias = (): Junta[] => {
  return nombres.map((nombre) => ({
    nombre,
    grados: "\n" + String(Math.floor(Math.random() * 181)) + "°",
    potenciometro: "\n" + String(Math.random().toFixed(2)),
  }));
};

const generarJuntasVacias = (): Junta[] => {
  return nombres.map((nombre) => ({
    nombre,
    grados: "\n-",
    potenciometro: "\n-",
  }));
};

export const useMonitorMock = () => {
  const { state } = useConexionSerial();
  const [juntas, setJuntas] = useState<Junta[]>(
    state.conectado ? generarJuntasAleatorias() : generarJuntasVacias()
  );

  useEffect(() => {
    if (!state.conectado) {
      setJuntas(generarJuntasVacias());
      return;
    }

    const interval = setInterval(() => {
      setJuntas(generarJuntasAleatorias());
    }, 2000);

    return () => clearInterval(interval);
  }, [state.conectado]);

  return { juntas, seleccionado: 0 };
};
