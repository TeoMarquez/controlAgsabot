// src/pages/traficoUCI/mock.ts
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

const baseRecibidos = [
  "T,120,90,92,95,91, 95,85,91,110,45; Brazo desplazándose hacia SPT.",
  "M; Se ordena modo manual.",
  "S; Orden de detenimiento total.",
  "T,115,80,90,130,5; Confirmación de posición alcanzada.",
  "M,128,89,91,132,6; Estado manual activado.",
  "S; Pausa temporal.",
];

function generateMockLogs(base: string[], count: number): LogEntry[] {
  const logs: LogEntry[] = [];
  let seconds = 5;
  let millis = 0;

  for (let i = 0; i < count; i++) {
    millis += 10;
    if (millis >= 100) {
      seconds += 1;
      millis = 0;
    }
    const timestamp = `00:00:${seconds.toString().padStart(2, "0")}.${millis
      .toString()
      .padStart(2, "0")}`;

    const message = base[i % base.length];
    logs.push({ timestamp, message });
  }
  return logs;
}

export const mensajesEnviados: LogEntry[] = generateMockLogs(baseEnviados, 100);
export const mensajesRecibidos: LogEntry[] = generateMockLogs(baseRecibidos, 100);
