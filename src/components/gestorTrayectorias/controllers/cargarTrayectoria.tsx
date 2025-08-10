import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Trayectoria } from "../gestorTrayectorias_Mock";

export async function cargarTrayectoria(): Promise<Trayectoria | null> {
  try {
    const filePath = await open({
      multiple: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath || Array.isArray(filePath)) {
      alert("No se seleccionó archivo.");
      return null;
    }

    const jsonString: string = await invoke("load_trajectory", { path: filePath });

    const trayectoria: Trayectoria = JSON.parse(jsonString);

    // Obtener nombre de archivo sin extensión:
    const fileNameWithExtension = filePath.split(/[/\\]/).pop() || "";
    const fileName = fileNameWithExtension.replace(/\.json$/i, "");

    // Asignar el nombre del archivo como nombre de la trayectoria:
    trayectoria.nombre = fileName;

    return trayectoria;
  } catch (error) {
    console.error("Error al cargar trayectoria:", error);
    alert("Error al cargar trayectoria.");
    return null;
  }
}

