export const conexionSerialMock = {
  puertosDisponibles: [
    { nombre: "COM3", descripcion: "Arduino Uno" },
    { nombre: "COM4", descripcion: "Sensor Serial USB" },
    { nombre: "/dev/ttyUSB0", descripcion: "AGSA-BOT Linux" },
  ],
  baudrates: [9600, 19200, 38400, 57600, 115200],
  estadoConexion: {
    puerto: "COM3",
    baudrate: 115200,
    conectado: true,
  },
};
