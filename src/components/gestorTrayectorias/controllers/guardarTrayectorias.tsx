import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { trayectoriaMock } from "../gestorTrayectorias_Mock";

export async function guardarTrayectoria() {
  try {
    // Mostrar diálogo para seleccionar dónde guardar
    const filePath = await save({
      defaultPath: "trayectoria.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath) {
      alert("No se seleccionó archivo.");
      return;
    }

    // Serializar el mock a JSON
    const contenido = JSON.stringify(trayectoriaMock, null, 2);

    // Enviar al backend
    await invoke("save_trajectory", {
      path: filePath,
      contenido,
    });

    alert("Trayectoria guardada exitosamente.");
  } catch (error) {
    console.error("Error al guardar trayectoria:", error);
    alert("Error al guardar trayectoria.");
  }
}