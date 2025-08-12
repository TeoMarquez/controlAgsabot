import { useConexionSerial } from "./components/conexionSerial/conexionSerial_Context";

export function MostrarEstadoConexion() {
  const { state } = useConexionSerial();

  return (
    <div style={{
      backgroundColor: "#f3f4f6",
      padding: "10px",
      borderRadius: "6px",
      fontFamily: "monospace",
      fontSize: "0.85rem",
      color: "#111",
      whiteSpace: "pre-wrap",
      marginBottom: "12px",
    }}>
      <strong>Estado conexión serial:</strong>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
