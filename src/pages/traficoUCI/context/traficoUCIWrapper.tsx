import TraficoUCI from "./components/TraficoUCI";
import { mensajesEnviados } from "./mockEnviados";
import { useMockRecibidos } from "./useMockRecibido";

export default function TraficoUCIWrapper() {
  const recibidos = useMockRecibidos();
  return <TraficoUCI enviados={mensajesEnviados} recibidos={recibidos} />;
}
