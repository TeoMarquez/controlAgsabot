use crate::serial::handler::SerialHandler;
use std::sync::Arc;
use tauri::command;

/// Command para enviar un punto como "set" a la URC
#[command]
pub fn set_point(punto: String, serial: tauri::State<Arc<SerialHandler>>) -> String {
    // Construimos la cadena para el Arduino, por ejemplo "T..." ya viene de frontend
    println!("Enviando set de trayectoria: {}", punto);

    match serial.escribir(punto) {
        Ok(_) => "OK: Set recibido".to_string(),
        Err(e) => format!("Error enviando set: {}", e),
    }
}
