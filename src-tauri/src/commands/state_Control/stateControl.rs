use crate::serial::handler::SerialHandler; // importar la estructura
use std::sync::Arc;
use tauri::command;

/// Command para cambiar el modo de la URC
#[command]
pub fn set_modo(modo: String, serial: tauri::State<Arc<SerialHandler>>) -> String {
    match modo.as_str() {
        "manual" => {
            println!("Modo -> Manual");
            if let Err(e) = serial.escribir("M".to_string()) {
                return format!("Error enviando M: {}", e);
            }
            "OK: Manual".to_string()
        }
        "stop" => {
            println!("Modo -> Stop");
            if let Err(e) = serial.escribir("S".to_string()) {
                return format!("Error enviando S: {}", e);
            }
            "OK: Stop".to_string()
        }
        "trayectoria" => {
            println!("Modo -> Trayectoria (enviando S primero)");
            if let Err(e) = serial.escribir("S".to_string()) {
                return format!("Error enviando S previo a Trayectoria: {}", e);
            }
            "OK: Trayectoria".to_string()
        }
        _ => "Error: modo inválido".to_string(),
    }
}
