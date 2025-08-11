#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
mod state;
mod commands;

use std::sync::{Arc, Mutex};
// use crate::serial::handler::SerialHandler;

use state::registro::Registro;
use commands::states_control::{obtener_datos_registro, set_modo, set_puerto_liberado, set_lista_texto, get_estado, set_conectar_serial, AppState};

// Importa el handler nuevo de tu módulo filesControl
use commands::filesControl::writeFile::{save_trajectory, load_trajectory};

// Importa el gestor de ventanas
use commands::windowsManager::trafficWindow::{abrir_ventana};


fn main() {
    // Estado para registro de datos recibidos
    let registro = Arc::new(Mutex::new(Registro {
        nombre: "N/A".into(),
        timestamp: "N/A".into(),
    }));

    // Estado global para control de modos y puerto liberado
    let estado = Arc::new(AppState::default());

    // Crear el SerialHandler, que manejará lectura y escritura según el estado
    // let serial_handler = SerialHandler::new(estado.clone());

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())  // inicializar plugin fs
        .manage(registro)
        .manage(estado)
        //.manage(serial_handler) // Opcional si lo necesitas
        .invoke_handler(tauri::generate_handler![
            set_modo,
            set_puerto_liberado,
            set_lista_texto,
            get_estado,
            obtener_datos_registro,
            set_conectar_serial,
            save_trajectory, // <-- Agregá tu comando aquí
            load_trajectory,
            abrir_ventana,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
