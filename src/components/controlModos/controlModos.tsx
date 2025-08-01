import React from "react";
import "./controlModos_Styles.css";
import { useConexionSerial } from "../conexionSerial/conexionSerial_Context";
import { useControlModos, useControlModosDispatch } from "./controlModos_Context";

const ControlModos = () => {
  const { state: conexionState } = useConexionSerial();
  const { modo } = useControlModos();
  const dispatch = useControlModosDispatch();

  const conexionDisponible =
    conexionState.puerto !== "" &&
    conexionState.baudrate !== "" &&
    conexionState.conectado;

  // Cuando se desconecta, deseleccionamos modo
  React.useEffect(() => {
    if (!conexionDisponible && modo !== "") {
      dispatch({ type: "SET_MODO", payload: "" });
    }
  }, [conexionDisponible, modo, dispatch]);

  const handleModoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_MODO", payload: e.target.value as any });
  };

  return (
    <div className="radio-input">
      <input
        type="radio"
        id="modo-manual"
        name="modo"
        value="manual"
        checked={modo === "manual"}
        onChange={handleModoChange}
        disabled={!conexionDisponible}
      />
      <label htmlFor="modo-manual">Modo Manual</label>

      <input
        type="radio"
        id="modo-trayectoria"
        name="modo"
        value="trayectoria"
        checked={modo === "trayectoria"}
        onChange={handleModoChange}
        disabled={!conexionDisponible}
      />
      <label htmlFor="modo-trayectoria">Modo Trayectoria</label>

      <input
        type="radio"
        id="modo-stop"
        name="modo"
        value="stop"
        checked={modo === "stop"}
        onChange={handleModoChange}
        disabled={!conexionDisponible}
      />
      <label htmlFor="modo-stop">Modo Stop</label>
    </div>
  );
};

export default ControlModos;
