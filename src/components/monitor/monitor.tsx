import React from "react";

// Importación explícita de imágenes
import cinturaImg from "../../assets/imagenes/partes_brazo/cintura.webp";
import hombroImg from "../../assets/imagenes/partes_brazo/hombro.webp";
import codoImg from "../../assets/imagenes/partes_brazo/codo.webp";
import muñecaImg from "../../assets/imagenes/partes_brazo/muñeca.webp";
import pinzaImg from "../../assets/imagenes/partes_brazo/pinza.webp";

interface Junta {
  nombre: string;
  grados: string;
  potenciometro: string;
}

interface MonitorProps {
  juntas: Junta[];
}

const imagenes: Record<string, string> = {
  cintura: cinturaImg,
  hombro: hombroImg,
  codo: codoImg,
  muñeca: muñecaImg,
  pinza: pinzaImg,
};

const Monitor: React.FC<MonitorProps> = ({ juntas }) => {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">Monitor de Juntas</h2>
      <div className="grid grid-cols-5 grid-rows-2 gap-4 items-center">
        {/* Imágenes */}
        {juntas.map((junta) => (
          <div key={junta.nombre} className="flex justify-center">
            <img
              src={imagenes[junta.nombre.toLowerCase()]}
              alt={junta.nombre}
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
          </div>
        ))}

        {/* Datos: grados y potenciometro */}
        {juntas.map((junta) => (
          <div
            key={junta.nombre + "-data"}
            className="text-center text-sm text-gray-700 border border-gray-300 rounded p-2 bg-gray-50 shadow-sm"
          >
            <div style={{ whiteSpace: "pre-line" }}>
              <strong>Grados:</strong> {junta.grados}
            </div>
            <div style={{ whiteSpace: "pre-line" }}>
              <strong>Pot:</strong> {junta.potenciometro}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Monitor;
