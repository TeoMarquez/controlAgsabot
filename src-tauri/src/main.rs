#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
mod commands;

use commands::filesControl::writeFile::{save_trajectory, load_trajectory};
use commands::windowsManager::trafficWindow::{abrir_ventana, ocultar_ventana};
use commands::controlUsb::controlar_Usb::{configurar_puerto,desconectar_puerto, obtener_estado_serial};

use tauri::{Manager, WindowEvent};
use tauri::Emitter;

use crate::serial::handler::{SerialSharedState, SerialHandler};
use std::sync::{Arc, Mutex};


fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        
        .invoke_handler(tauri::generate_handler![
            save_trajectory,
            load_trajectory,
            abrir_ventana,
            ocultar_ventana,
            configurar_puerto,
            desconectar_puerto,
            obtener_estado_serial,

        ])
        .setup(|app| {
            let app_handle = app.handle();


            let shared_state = Arc::new(SerialSharedState {
                puerto_liberado: Mutex::new(true),  // puerto inicialmente cerrado
                puerto: Mutex::new(String::new()),  // vacío porque no hay puerto asignado
                velocidad: Mutex::new(9600),        // o lo que quieras default
                modo: Mutex::new("S".to_string()),
            });

            // Crear el handler serial, pasando el estado y app_handle
            let serial_handler = SerialHandler::new(shared_state.clone(), app_handle.clone());

            // Registrar en el estado global de Tauri para poder inyectarlo en comandos
            app.manage(shared_state);
            app.manage(serial_handler);


            // Ventanas secundarias: ocultar en vez de cerrar + emitir evento cuando se oculta
            for label in &[
                    "ventana_trafico_uci",
                    "ventana_visualizacion_3d",
                ] {
                    if let Some(window) = app_handle.get_window(label) {
                        let window_clone = window.clone();
                        let app_handle_clone = app_handle.clone();
                        let label_clone = label.to_string();

                        window_clone.clone().on_window_event(move |event| {
                            if let WindowEvent::CloseRequested { api, .. } = event {
                                api.prevent_close();

                                // Usamos la clon para esconder
                                window_clone.hide().unwrap();

                                // Emitir evento que ventana se ocultó
                                if let Some(main_window) = app_handle_clone.get_window("main") {
                                    let _ = main_window.emit(
                                        "window-visibility-changed",
                                        (label_clone.clone(), false),
                                    );
                                }
                            }
                        });
                    }
                }

            // Ventana principal: cerrar toda la app al cerrar esta ventana
            if let Some(main_window) = app_handle.get_window("main") {
                let app_handle_clone = app_handle.clone();
                main_window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { .. } = event {
                        app_handle_clone.exit(0);
                    }
                });
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
