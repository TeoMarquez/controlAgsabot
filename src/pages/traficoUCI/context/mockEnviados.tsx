// src/pages/traficoUCI/mockEnviados.ts
export interface LogEntry {
  timestamp: string;
  message: string;
}

const baseEnviados = [
  "M,89,90,92,95,91, 89,90,92,95,91; Inicio del sistema. Estado manual.",
  "M,120,90,92,95,91, 89,90,92,95,91; Se cambió el cursor manual de cintura.",
  "T,100,80,90,135,0; Orden de trayectoria a cintura=100, hombro=80.",
  "M,125,85,90,130,5; Ajuste manual de brazo.",
  "T,110,75,95,140,10; Nueva orden de trayectoria.",
  "S; Detener movimientos.",
  "M,130,88,92,133,7; Ajuste fino de posiciones.",
];

export const mensajesEnviados: LogEntry[] = baseEnviados.map((msg, i) => ({
  timestamp: `00:00:${Math.floor(i / 100).toString().padStart(2, "0")}.${(i % 100).toString().padStart(2, "0")}`,
  message: msg,
}));