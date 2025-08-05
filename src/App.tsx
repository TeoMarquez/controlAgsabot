import { ConexionSerialProvider } from "./components/conexionSerial/conexionSerial_Context";
import { ControlModosProvider } from "./components/controlModos/controlModos_Context";
import ControlModos from "./components/controlModos/controlModos";
import { ConexionSerial } from "./components/conexionSerial/conexionSerial";
import Header from "./components/Header";
import Monitor from "./components/monitor/monitor";
import { useMonitorMock } from "./components/monitor/monitor_Mock";
import "./styles/globals.css";

function App() {
  const handleTutorialClick = () => {
    alert("Tutorial activado (próximamente)");
  };

  return (
    <ConexionSerialProvider>
      <ControlModosProvider>
        <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
          <Header onTutorialClick={handleTutorialClick} />
          <main className="flex-grow p-4">
            <div className="flex">
              {/* Contenedor monitor con ancho fijo */}
              <div className="w-130 shadow-xl rounded-lg bg-white p-4">
                <MonitorWrapper/>
              </div>

              {/* Separación horizontal */}
              <div className="w-15" />

              {/* Contenedor controles con flex-grow para ocupar espacio restante */}
              <div className="flex-grow max-w-md flex flex-col space-y-4">
                <ConexionSerial />
                <ControlModos />
              </div>
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
