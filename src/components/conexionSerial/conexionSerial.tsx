import { useConexionSerial } from "./conexionSerial_Context";
import { conexionSerialMock } from "./conexionSerial_Mock";
import "./conexionSerial_Styles.css";
import { invoke } from "@tauri-apps/api/core";

export const ConexionSerial = () => {
  const { state, dispatch } = useConexionSerial();

  const conexionDisponible = state.puerto !== "" && state.baudrate !== "";

  const toggleConexion = async () => {
    if (!state.conectado) {
      if (conexionDisponible) {
        try {
          await invoke("configurar_puerto", {
            puerto: state.puerto,
            velocidad: Number(state.baudrate),
          });
          dispatch({ type: "TOGGLE_CONEXION" });
        } catch (e) {
          console.error("Error al configurar puerto:", e);
          // Podés mostrar notificación o alerta aquí
        }
      }
    } else {
      try {
        await invoke("desconectar_puerto");
        dispatch({ type: "TOGGLE_CONEXION" });
      } catch (e) {
        console.error("Error al desconectar puerto:", e);
        // Notificación o manejo de error
      }
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4">
      {/* Selector de puerto */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Puerto</label>
        <select
          value={state.puerto}
          onChange={(e) => dispatch({ type: "SET_PUERTO", payload: e.target.value })}
          disabled={state.conectado}
          className="mt-1 block w-44 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-gray-200"
        >
          <option value="">Seleccione uno</option>
          {conexionSerialMock.puertosDisponibles.map((p) => (
            <option key={p.nombre} value={p.nombre}>
              {p.nombre} ({p.descripcion})
            </option>
          ))}
        </select>
      </div>

      {/* Selector de baudrate */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Baudrate</label>
        <select
          value={state.baudrate}
          onChange={(e) => dispatch({ type: "SET_BAUDRATE", payload: e.target.value })}
          disabled={state.conectado}
          className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-gray-200"
        >
          <option value="">Seleccione uno</option>
          {conexionSerialMock.baudrates.map((b) => (
            <option key={b} value={String(b)}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Switch */}
      <div className="checkbox-wrapper-8">
        <input
          type="checkbox"
          id="cb3-8"
          className="tgl tgl-skewed"
          checked={state.conectado}
          onChange={toggleConexion}
          disabled={!conexionDisponible && !state.conectado}
        />
        <label htmlFor="cb3-8" data-tg-on="ON" data-tg-off="OFF" className="tgl-btn" />
      </div>
    </div>
  );
};
