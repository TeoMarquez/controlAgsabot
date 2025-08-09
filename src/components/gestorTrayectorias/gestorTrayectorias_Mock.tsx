export interface Junta {
  nombre: string;
  grados: string;
}

export interface PuntoTrayectoria {
  juntas: Junta[];
}

export interface Trayectoria {
  nombre: string;
  puntos: PuntoTrayectoria[];
}

const nombres = ["Cintura", "Hombro", "Codo", "Muñeca", "Pinza"];

const generarJuntasAleatorias = (): Junta[] => {
  return nombres.map((nombre) => ({
    nombre,
    grados: String(Math.floor(Math.random() * 181)) + "°",
  }));
};

// Ejemplo de mock con nombre y puntos
export const trayectoriaMock: Trayectoria = {
  nombre: "Trayectoria ejemplo",
  puntos: Array(5)
    .fill(null)
    .map(() => ({
      juntas: generarJuntasAleatorias(),
    })),
};
