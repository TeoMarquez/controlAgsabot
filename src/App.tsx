import { useState} from "react";
import { invoke } from "@tauri-apps/api/core";
import { ConexionSerialProvider } from "./components/conexionSerial/conexionSerial_Context";
import { ControlModosProvider } from "./components/controlModos/controlModos_Context";
import ControlModos from "./components/controlModos/controlModos";
import { ConexionSerial } from "./components/conexionSerial/conexionSerial";
import Header from "./components/Header";
import Monitor from "./components/monitor/monitor";
import { useMonitorMock } from "./components/monitor/monitor_Mock";
import "./styles/globals.css";
import { GestorTrayectorias } from "./components/gestorTrayectorias/gestorTrayectorias";
import { BotonVentanaSecundaria } from "./components/newWindow_Trafico/btnVentanaTrafico";

// import {MostrarEstadoConexion} from "./estadoSeria" // Componente para mostrar el estado de la conexión serial
// import {VerEventoMonitor} from "./ver_EventoMonitor" // Componente que muestra el evento raw
// import {VerEventoParser} from "./ver_EventoParseado" // Componente que muestra el evento parser


function App() {

  const [conectado, setConectado] = useState(false);

  const handleTutorialClick = () => {
    alert("Tutorial activado (próximamente)");
  };

  const toggleConexion = async () => {
    const nuevoValor = !conectado;
    await invoke("set_conectar_serial", { valor: nuevoValor });
    setConectado(nuevoValor);
  };

  return (
    <ConexionSerialProvider>
      <ControlModosProvider>
        <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
          <Header onTutorialClick={handleTutorialClick} />
          <main className="flex-grow p-4">
            {/* Primera fila: monitor + conexión + control */}
            <div className="flex mb-6">
              {/* Contenedor monitor */}
              <div className="w-130 shadow-xl rounded-lg bg-white p-4">
                <MonitorWrapper />
              </div>

              {/* Separación */}
              <div className="w-15" />

              {/* Controles */}
              <div className="flex-grow max-w-md flex flex-col space-y-4">
                <ConexionSerial />
                <ControlModos />
                <button
                  onClick={toggleConexion}
                  className={`px-4 py-2 rounded text-white transition ${
                    conectado ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {conectado ? "Conectado" : "Desconectado"}
                </button>

                <BotonVentanaSecundaria
                  label="Abrir Ventana de Tráfico"
                  windowLabel="ventana_trafico_uci"
                />
                <BotonVentanaSecundaria
                  label="Abrir Visualizador 3D"
                  windowLabel="ventana_visualizacion_3d"
                />
          
                {/* <MostrarEstadoConexion />  */}
                {/* <VerEventoMonitor /> */}
                {/* <VerEventoParser /> */} 

                
              </div>
            </div>

            {/* Aquí abajo, todo el ancho, el Gestor de Trayectorias */}
            <div className="shadow-xl rounded-lg bg-white p-4">
              <GestorTrayectorias />
            </div>
          </main>
        </div>
      </ControlModosProvider>
    </ConexionSerialProvider>
  );

  function MonitorWrapper() {
    const monitorMock = useMonitorMock();
    return <Monitor juntas={monitorMock.juntas} />;
  }
}

export default App;
