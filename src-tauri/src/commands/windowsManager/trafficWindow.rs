use tauri::{AppHandle, Manager};
use tauri::Emitter; 

#[tauri::command]
pub fn abrir_ventana(app_handle: AppHandle, label: String) -> Result<String, String> {
    if let Some(window) = app_handle.get_window(&label) {
        window.show().map_err(|e| e.to_string())?;

        // Emitir evento que ventana se mostró (visible = true)
        if let Some(main_window) = app_handle.get_window("main") {
            let _ = main_window.emit(
                "window-visibility-changed",
                (label.clone(), true),
            );
        }

        Ok(format!("Ventana '{}' mostrada", label))
    } else {
        Err(format!("No existe ventana con label '{}'", label))
    }
}

#[tauri::command]
pub fn ocultar_ventana(app_handle: AppHandle, label: String) -> Result<String, String> {
    if let Some(window) = app_handle.get_window(&label) {
        window.hide().map_err(|e| e.to_string())?;
        if let Some(main_window) = app_handle.get_window("main") {
            let _ = main_window.emit("window-visibility-changed", (label.clone(), false));
        }
        Ok(format!("Ventana '{}' oculta", label))
    } else {
        Err(format!("No existe ventana con label '{}'", label))
    }
}