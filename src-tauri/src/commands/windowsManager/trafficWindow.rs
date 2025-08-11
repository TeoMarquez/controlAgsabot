use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn abrir_ventana(app_handle: AppHandle, label: String) -> Result<String, String> {
    if let Some(window) = app_handle.get_window(&label) {
        window.show().map_err(|e| e.to_string())?;
        Ok(format!("Ventana '{}' mostrada", label))
    } else {
        Err(format!("No existe ventana con label '{}'", label))
    }
}
