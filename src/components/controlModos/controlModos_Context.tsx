import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

type Modo = "manual" | "trayectoria" | "stop" | "";

type ControlModosState = {
  modo: Modo;
};

type ControlModosAction =
  | { type: "SET_MODO"; payload: Modo }
  | { type: "RESET_MODO" };

const initialState: ControlModosState = {
  modo: "",
};

const ControlModosStateContext = createContext<ControlModosState | undefined>(
  undefined
);
const ControlModosDispatchContext = createContext<
  Dispatch<ControlModosAction> | undefined
>(undefined);

function controlModosReducer(
  state: ControlModosState,
  action: ControlModosAction
): ControlModosState {
  switch (action.type) {
    case "SET_MODO":
      return { modo: action.payload };
    case "RESET_MODO":
      return { modo: "" };
    default:
      return state;
  }
}

export const ControlModosProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(controlModosReducer, initialState);

  return (
    <ControlModosStateContext.Provider value={state}>
      <ControlModosDispatchContext.Provider value={dispatch}>
        {children}
      </ControlModosDispatchContext.Provider>
    </ControlModosStateContext.Provider>
  );
};

export const useControlModos = () => {
  const context = useContext(ControlModosStateContext);
  if (context === undefined) {
    throw new Error("useControlModos debe usarse dentro de ControlModosProvider");
  }
  return context;
};

export const useControlModosDispatch = () => {
  const context = useContext(ControlModosDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useControlModosDispatch debe usarse dentro de ControlModosProvider"
    );
  }
  return context;
};
