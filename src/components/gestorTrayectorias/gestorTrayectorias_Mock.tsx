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

export const trayectoriaMock: Trayectoria = {
  nombre: "",
  puntos: [],
};
