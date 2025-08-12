export const conexionSerialMock = {
  puertosDisponibles: [
    { nombre: "COM3", descripcion: "Arduino Uno" },
    { nombre: "COM4", descripcion: "generic WebCam" },
    { nombre: "COM5", descripcion: "" }, // adaptador USB a serial CH340
    { nombre: "COM6", descripcion: "" }, // adaptador USB a serial CH340
  ],
  baudrates: [9600, 19200, 38400, 57600, 115200],
};
