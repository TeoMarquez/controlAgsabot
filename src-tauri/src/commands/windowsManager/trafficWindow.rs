use tauri::{AppHandle};
use tauri_runtime_wry::TaoWindowBuilder;

#[tauri::command]
pub fn abrir_ventana(app_handle: AppHandle, label: String) -> String {
    let label_clone = label.clone();

    let (url, position, size) = match label.as_str() {
            "Ventana de Trafico UCI" => ("/traficoUCI.html", (100, 100), (800, 600)),
            "Visualizacion 3D" => ("/visualizador3d.html", (950, 100), (900, 700)),

        _ => ("/index.html", (200, 200), (800, 600)),
    };

    let _ = app_handle
        .create_tao_window(move || {
            let window_builder = TaoWindowBuilder::new()
                .with_title(label_clone.clone())
                .with_inner_size(tauri::PhysicalSize::new(size.0, size.1))
                .with_position(tauri::PhysicalPosition::new(position.0, position.1))
                .with_resizable(true);
            (url.to_string(), window_builder)
        })
        .expect("failed to create window");

    format!("Ventana '{}' creada y abierta en '{}'", label, url)
}
