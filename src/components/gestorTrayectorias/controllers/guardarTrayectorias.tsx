import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export async function guardarTrayectoria(trayectoria: Trayectoria): Promise<boolean> {
  try {
    // Determinar defaultPath dinámicamente
    const defaultFileName =
      trayectoria.nombre && trayectoria.nombre.trim() !== ""
        ? `${trayectoria.nombre.trim()}.json`
        : undefined;

    const filePath = await save({
      // solo incluir defaultPath si hay nombre válido
      ...(defaultFileName ? { defaultPath: defaultFileName } : {}),
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath) {
      alert("No se seleccionó archivo.");
      return false; // usuario canceló
    }

    const contenido = JSON.stringify(trayectoria, null, 2);

    await invoke("save_trajectory", {
      path: filePath,
      contenido,
    });

    alert("Trayectoria guardada exitosamente.");
    return true;
  } catch (error) {
    console.error("Error al guardar trayectoria:", error);
    alert("Error al guardar trayectoria.");
    return false;
  }
}
