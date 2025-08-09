#[tauri::command]
pub fn save_trajectory(path: String, contenido: String) -> Result<(), String> {
    std::fs::write(path, contenido).map_err(|e| e.to_string())
}