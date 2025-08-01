#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
mod state;
mod commands;

use std::sync::{Arc, Mutex};

use chrono::Local;
use state::registro::Registro;
use commands::states_control::{obtener_datos_registro,set_modo, set_puerto_liberado, set_lista_texto, get_estado, AppState};

// Importa el handler nuevo
use serial::handler::SerialHandler;

fn main() {
    // Estado para registro de datos recibidos
    let registro = Arc::new(Mutex::new(Registro {
        nombre: "N/A".into(),
        timestamp: "N/A".into(),
    }));

    // Estado global para control de modos y puerto liberado
    let estado = Arc::new(AppState::default());

    // Crear el SerialHandler, que manejará lectura y escritura según el estado
    let serial_handler = SerialHandler::new(estado.clone());

    // Aquí podrías guardar `serial_handler` si necesitas usarlo para enviar comandos desde backend

    tauri::Builder::default()
        .manage(registro)
        .manage(estado)
        //.manage(serial_handler) // Opcional, solo si quieres exponerlo a comandos
        .invoke_handler(tauri::generate_handler![
            set_modo,
            set_puerto_liberado,
            set_lista_texto,
            get_estado,
            obtener_datos_registro,
            // Aquí luego agregarías comandos que usen serial_handler para escribir, si los defines
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
