#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
mod state;
mod commands;

use std::sync::{Arc, Mutex};

use state::registro::Registro;
use commands::states_control::{
    obtener_datos_registro, set_modo, set_puerto_liberado, set_lista_texto, get_estado,
    set_conectar_serial, AppState,
};

use commands::filesControl::writeFile::{save_trajectory, load_trajectory};
use commands::windowsManager::trafficWindow::{abrir_ventana, ocultar_ventana};

use tauri::{Manager, WindowEvent};
use tauri::Emitter;


fn main() {
    let registro = Arc::new(Mutex::new(Registro {
        nombre: "N/A".into(),
        timestamp: "N/A".into(),
    }));

    let estado = Arc::new(AppState::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(registro)
        .manage(estado)
        .invoke_handler(tauri::generate_handler![
            set_modo,
            set_puerto_liberado,
            set_lista_texto,
            get_estado,
            obtener_datos_registro,
            set_conectar_serial,
            save_trajectory,
            load_trajectory,
            abrir_ventana,
            ocultar_ventana, // ← nuevo

        ])
        .setup(|app| {
            let app_handle = app.handle();

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
