#[tauri::command]
pub fn save_trajectory(path: String, contenido: String) -> Result<(), String> {
    std::fs::write(path, contenido).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_trajectory(path: String) -> Result<String, String> {
  std::fs::read_to_string(&path).map_err(|e| e.to_string())
}
