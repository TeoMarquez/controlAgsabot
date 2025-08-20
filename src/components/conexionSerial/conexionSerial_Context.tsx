import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

type EstadoConexionSerial = {
  puerto: string;
  baudrate: string;
  conectado: boolean;
};

type ConexionSerialState = EstadoConexionSerial;

type ConexionSerialAction =
  | { type: "SET_PUERTO"; payload: string }
  | { type: "SET_BAUDRATE"; payload: string }
  | { type: "TOGGLE_CONEXION" }
  | { type: "RESET_CONEXION" }
  | { type: "SET_ESTADO"; payload: ConexionSerialState };

const initialState: ConexionSerialState = {
  puerto: "",
  baudrate: "",
  conectado: false,
};

function conexionSerialReducer(
  state: ConexionSerialState,
  action: ConexionSerialAction
): ConexionSerialState {
  switch (action.type) {
    case "SET_PUERTO":
      return { ...state, puerto: action.payload };
    case "SET_BAUDRATE":
      return { ...state, baudrate: action.payload };
    case "TOGGLE_CONEXION":
      if (state.conectado) {
        return { puerto: "", baudrate: "", conectado: false };
      } else {
        if (state.puerto !== "" && state.baudrate !== "") {
          return { ...state, conectado: true };
        }
        return state;
      }
    case "RESET_CONEXION":
      return { puerto: "", baudrate: "", conectado: false };
    case "SET_ESTADO":
      return action.payload;
    default:
      return state;
  }
}

type ConexionSerialContextType = {
  state: ConexionSerialState;
  dispatch: React.Dispatch<ConexionSerialAction>;
};

const ConexionSerialContext = createContext<ConexionSerialContextType | undefined>(
  undefined
);

export const ConexionSerialProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(conexionSerialReducer, initialState);

  // Al montar, leer estado real desde backend
  useEffect(() => {
    (async () => {
      try {
        const [puerto, velocidad, conectado] = await invoke<[string, number, boolean]>("obtener_estado_serial");
        dispatch({
          type: "SET_ESTADO",
          payload: {
            puerto,
            baudrate: String(velocidad),
            conectado,
          },
        });
      } catch (e) {
        console.error("Error obteniendo estado serial:", e);
      }
    })();
  }, []);

  return (
    <ConexionSerialContext.Provider value={{ state, dispatch }}>
      {children}
    </ConexionSerialContext.Provider>
  );
};

export const useConexionSerial = (): ConexionSerialContextType => {
  const context = useContext(ConexionSerialContext);
  if (!context) {
    throw new Error("useConexionSerial debe usarse dentro de un ConexionSerialProvider");
  }
  return context;
};
