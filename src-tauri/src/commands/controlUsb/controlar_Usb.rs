use std::sync::Arc;
use crate::serial::handler::SerialSharedState;
use serialport::SerialPortType;

#[derive(Clone, serde::Serialize)]
pub struct PuertoSerial {
    pub nombre: String,
    pub descripcion: String,
}

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

#[tauri::command]
pub fn listar_puertos() -> Vec<PuertoSerial> {
    let mut puertos = Vec::new();

    match serialport::available_ports() {
        Ok(ports) => {
            for p in ports {
                let descripcion = match &p.port_type {
                    SerialPortType::UsbPort(info) => format!(
                        "{} {}",
                        info.manufacturer.as_deref().unwrap_or(""),
                        info.product.as_deref().unwrap_or("")
                    ),
                    _ => "".to_string(),
                };

                puertos.push(PuertoSerial {
                    nombre: p.port_name,
                    descripcion,
                });
            }
        }
        Err(_) => {}
    }

    puertos
}