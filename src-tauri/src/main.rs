#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
mod commands;
mod worker_Trajectory;
mod logs;

use commands::filesControl::writeFile::{save_trajectory, load_trajectory};
use commands::windowsManager::trafficWindow::{abrir_ventana, ocultar_ventana};
use commands::controlUsb::controlar_Usb::{configurar_puerto,desconectar_puerto, obtener_estado_serial,listar_puertos};
use commands::state_Control::stateControl::{set_modo};
use commands::trayectorias::trajectory_handle::{set_point,enqueue_trayectoria};
use serial::handler::{export_buffer};

use tauri::{Manager, WindowEvent};
use tauri::Emitter;
use tauri::Listener;

use crate::serial::handler::{SerialSharedState, SerialHandler};
use crate::commands::trayectorias::trajectory_handle::TrayectoriaQueue;
use crate::worker_Trajectory::worker_thread::start_trayectoria_worker;
use crate::logs::log_sending::{start_logger_thread, LogCommand, export_log,};
use crate::logs::log_sending::LogEntry;


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
            listar_puertos,
            obtener_estado_serial,
            set_modo,
            set_point,
            enqueue_trayectoria,
            export_log,
            export_buffer,
        ])
        .setup(|app| {
            let app_handle = app.handle();


            let shared_state = Arc::new(SerialSharedState {
                puerto_liberado: Mutex::new(true),  // puerto inicialmente cerrado
                puerto: Mutex::new(String::new()),  // vacío porque no hay puerto asignado
                velocidad: Mutex::new(9600),        // o lo que quieras default
                modo: Mutex::new("S".to_string()),
            });

             let trayectoria_queue = Arc::new(TrayectoriaQueue {
                puntos: Mutex::new(Vec::new()),
            });

            let logger_sender = start_logger_thread();              // logger de lectura

            let serial_handler = Arc::new(SerialHandler::new(
                shared_state.clone(),
                app_handle.clone(),
            ));

            let logger_clone = logger_sender.clone();
            app_handle.listen("serial-raw", move |event| {
                let payload = event.payload();
                if !payload.is_empty() {
                    let timestamp = chrono::Local::now().format("%H:%M:%S%.3f").to_string();
                    let _ = logger_clone.send(LogCommand::NewMessage(LogEntry {
                        timestamp,
                        message: payload.to_string(),
                    }));
                }
            });

            app.manage(shared_state);
            app.manage(serial_handler.clone());
            app.manage(trayectoria_queue.clone());
            app.manage(logger_sender);

            start_trayectoria_worker(serial_handler.clone(), trayectoria_queue.clone());

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
