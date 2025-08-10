// monitor_Mock.ts
import { useEffect, useState } from "react";
import { useConexionSerial } from "../conexionSerial/conexionSerial_Context";

interface Junta {
  nombre: string;
  grados: string;
  potenciometro: string;
}

const nombres = ["Cintura", "Hombro", "Codo", "Muñeca", "Pinza"];

const generarJuntasFijas = (): Junta[] => {
  const gradosFijos = [30, 40, 50, 60, 70];
  return nombres.map((nombre, index) => ({
    nombre,
    grados: "\n" + gradosFijos[index] + "°",
    potenciometro: "\n" + (0.5 + index * 0.1).toFixed(2), // valor mock de potenciómetro
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
    state.conectado ? generarJuntasFijas() : generarJuntasVacias()
  );

  useEffect(() => {
    if (!state.conectado) {
      setJuntas(generarJuntasVacias());
      return;
    }

    // Si está conectado, setea siempre los valores fijos
    setJuntas(generarJuntasFijas());

  }, [state.conectado]);

  return { juntas, seleccionado: 0 };
};
