import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [nombre, setNombre] = useState<string>("N/A");
  const [hora, setHora] = useState<string>("N/A");

  const [modo, setModo] = useState<"automatico" | "manual" | "stop">("stop");
  const [puertoLiberado, setPuertoLiberado] = useState(false);
  const [listaTexto, setListaTexto] = useState("");

  useEffect(() => {
    const intervalo = setInterval(() => {
      invoke<[string, string]>("obtener_datos_registro")
        .then(([n, h]) => {
          setNombre(n);
          setHora(h);
        })
        .catch(console.error);
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const handleModoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value as "automatico" | "manual" | "stop";
    setModo(valor);
    invoke("set_modo", { modo: valor }).catch(console.error);
  };

  const handleLiberarPuerto = () => {
    const nuevoEstado = !puertoLiberado;
    setPuertoLiberado(nuevoEstado);
    invoke("set_puerto_liberado", { liberar: nuevoEstado }).catch(console.error);
  };

  const handleSubmitLista = (e: React.FormEvent) => {
    e.preventDefault();

    if (!listaTexto.trim()) {
      alert("Por favor, ingrese texto en el área antes de enviar.");
      return;
    }

    invoke("set_lista_texto", { texto: listaTexto.trim() }).catch(console.error);

    alert("Lista enviada:\n" + listaTexto.trim());
    setListaTexto("");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Registro AGGSABOT</h1>
      <p>
        Hola <b>{nombre}</b>
      </p>
      <p>
        Horario de registro de <b>{nombre}</b> a: <b>{hora}</b>
      </p>

      <div style={{ marginTop: "2rem" }}>
        <h2>Modo de operación</h2>
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            name="modo"
            value="automatico"
            checked={modo === "automatico"}
            onChange={handleModoChange}
          />{" "}
          Automático
        </label>
        <label style={{ marginRight: "1rem" }}>
          <input
            type="radio"
            name="modo"
            value="manual"
            checked={modo === "manual"}
            onChange={handleModoChange}
          />{" "}
          Manual
        </label>
        <label>
          <input
            type="radio"
            name="modo"
            value="stop"
            checked={modo === "stop"}
            onChange={handleModoChange}
          />{" "}
          Stop
        </label>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={handleLiberarPuerto}
          style={{
            backgroundColor: puertoLiberado ? "#dc3545" : "#28a745",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "background-color 0.3s",
          }}
        >
          {puertoLiberado ? "Activar puerto serial" : "Liberar puerto serial"}
        </button>
      </div>

      <form onSubmit={handleSubmitLista} style={{ marginTop: "2rem" }}>
        <h2>Modo lista</h2>
        <textarea
          placeholder="Ingrese texto aquí"
          value={listaTexto}
          onChange={(e) => setListaTexto(e.target.value)}
          rows={6}
          style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
        />
        <button
          type="submit"
          style={{
            marginTop: "0.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Enviar lista
        </button>
      </form>
    </div>
  );
}

export default App;
