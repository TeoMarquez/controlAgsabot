import { save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export async function guardarTrayectoria(trayectoria: Trayectoria): Promise<Trayectoria | null> {
  try {
    const defaultFileName =
      trayectoria.nombre && trayectoria.nombre.trim() !== ""
        ? `${trayectoria.nombre.trim()}.json`
        : undefined;

    const filePath = await save({
      ...(defaultFileName ? { defaultPath: defaultFileName } : {}),
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    if (!filePath) {
      alert("No se seleccionó archivo.");
      return null;
    }

    const contenido = JSON.stringify(trayectoria, null, 2);

    await invoke("save_trajectory", {
      path: filePath,
      contenido,
    });

    // Obtener solo el nombre del archivo sin extensión
    const fileNameWithExtension = filePath.split(/[/\\]/).pop() || "";
    const fileName = fileNameWithExtension.replace(/\.json$/i, "");

    // Actualizar el nombre
    const trayectoriaActualizada = { ...trayectoria, nombre: fileName };

    alert("Trayectoria guardada exitosamente.");
    return trayectoriaActualizada;
  } catch (error) {
    console.error("Error al guardar trayectoria:", error);
    alert("Error al guardar trayectoria.");
    return null;
  }
}