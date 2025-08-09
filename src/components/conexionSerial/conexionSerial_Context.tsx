import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Defino el estado específico para conexión serial
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
  | { type: "RESET_CONEXION" };

const initialState: ConexionSerialState = {
  puerto: "",
  baudrate: "",
  conectado: false,
};

// Reducer simple para manejar acciones del estado
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
      // Si desconectamos, reseteamos puerto y baudrate
      if (state.conectado) {
        return { puerto: "", baudrate: "", conectado: false };
      } else {
        // Si conectamos, sólo activamos conectado (puerto y baudrate deben estar set)
        if (state.puerto !== "" && state.baudrate !== "") {
          return { ...state, conectado: true };
        }
        // Si no está todo seleccionado, no conectamos
        return state;
      }
    case "RESET_CONEXION":
      return { puerto: "", baudrate: "", conectado: false };
    default:
      return state;
  }
}

// Definimos el tipo de contexto
type ConexionSerialContextType = {
  state: ConexionSerialState;
  dispatch: React.Dispatch<ConexionSerialAction>;
};

const ConexionSerialContext = createContext<ConexionSerialContextType | undefined>(
  undefined
);

export const ConexionSerialProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(conexionSerialReducer, initialState);

  return (
    <ConexionSerialContext.Provider value={{ state, dispatch }}>
      {children}
    </ConexionSerialContext.Provider>
  );
};

// Hook para usar contexto fácilmente
export const useConexionSerial = (): ConexionSerialContextType => {
  const context = useContext(ConexionSerialContext);
  if (!context) {
    throw new Error(
      "useConexionSerial debe usarse dentro de un ConexionSerialProvider"
    );
  }
  return context;
};
