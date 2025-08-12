use std::sync::Arc;
use crate::serial::handler::SerialSharedState;

#[tauri::command]
pub fn configurar_puerto(
    shared_state: tauri::State<Arc<SerialSharedState>>, 
    puerto: String, 
    velocidad: u32
) -> Result<(), String> {
    {
        let mut p = shared_state.puerto.lock().unwrap();
        *p = puerto;
    }
    {
        let mut v = shared_state.velocidad.lock().unwrap();
        *v = velocidad;
    }
    {
        let mut liberado = shared_state.puerto_liberado.lock().unwrap();
        *liberado = false; // indica que el puerto debe abrirse
    }
    Ok(())
}

#[tauri::command]
pub fn desconectar_puerto(shared_state: tauri::State<Arc<SerialSharedState>>) -> Result<(), String> {
    let mut liberado = shared_state.puerto_liberado.lock().unwrap();
    *liberado = true; // indica que el worker debe cerrar el puerto
    Ok(())
}

#[tauri::command]
pub fn obtener_estado_serial(shared_state: tauri::State<Arc<SerialSharedState>>) -> Result<(String, u32, bool), String> {
    let puerto = shared_state.puerto.lock().unwrap().clone();
    let velocidad = *shared_state.velocidad.lock().unwrap();
    let liberado = *shared_state.puerto_liberado.lock().unwrap();
    let conectado = !liberado && !puerto.is_empty();
    Ok((puerto, velocidad, conectado))
}