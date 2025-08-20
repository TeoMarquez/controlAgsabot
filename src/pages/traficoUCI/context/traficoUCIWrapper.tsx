import TraficoUCI from "./components/TraficoUCI";
import { useEnviados } from "../context/mockEnviados";
import { useMockRecibidos } from "./useMockRecibido";

export default function TraficoUCIWrapper() {
  const recibidos = useMockRecibidos();
  const enviados = useEnviados();
  return <TraficoUCI enviados={enviados} recibidos={recibidos} />;
}
