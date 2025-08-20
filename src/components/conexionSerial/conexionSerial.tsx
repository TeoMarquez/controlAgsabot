import { useConexionSerial } from "./conexionSerial_Context";
import { conexionSerialMock } from "./conexionSerial_Mock"; // solo para baudrates
import "./conexionSerial_Styles.css";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { toast} from "react-toastify";
import { listen } from "@tauri-apps/api/event";
import "react-toastify/dist/ReactToastify.css";

export const ConexionSerial = () => {
  const { state, dispatch } = useConexionSerial();
  const [puertosDisponibles, setPuertosDisponibles] = useState<{ nombre: string; descripcion: string }[]>([]);

  const conexionDisponible = state.puerto !== "" && state.baudrate !== "";

  // Función para actualizar puertos al abrir el select
  const actualizarPuertos = async () => {
    try {
      const puertos = await invoke("listar_puertos") as { nombre: string; descripcion: string }[];
      setPuertosDisponibles(puertos);
    } catch (e) {
      console.error("Error al listar puertos:", e);
      setPuertosDisponibles([]); // fallback
    }
  };

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
          toast.error("Error al configurar puerto");
        }
      }
    } else {
      try {
        await invoke("desconectar_puerto");
        dispatch({ type: "TOGGLE_CONEXION" });
      } catch (e) {
        console.error("Error al desconectar puerto:", e);
        toast.error("Error al desconectar puerto");
      }
    }
  };

  // Escuchar errores serial desde backend
  useEffect(() => {
    const unlisten = listen<string>("serial-error", (event) => {
      toast.error(event.payload);
    });

    return () => {
      unlisten.then((f) => f()); // limpiar listener al desmontar
    };
  }, []);

  return (
    <div className="flex items-center space-x-4 p-4">
      {/* Selector de puerto */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Puerto</label>
        <select
          value={state.puerto}
          onClick={actualizarPuertos} // refresca puertos al abrir
          onChange={(e) => dispatch({ type: "SET_PUERTO", payload: e.target.value })}
          disabled={state.conectado}
          className="mt-1 block w-44 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm disabled:bg-gray-200"
        >
          <option value="">Seleccione uno</option>
          {puertosDisponibles.map((p) => (
            <option key={p.nombre} value={p.nombre}>
              {p.nombre} ({p.descripcion})
            </option>
          ))}
        </select>
      </div>

      {/* Selector de baudrate (mock) */}
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
