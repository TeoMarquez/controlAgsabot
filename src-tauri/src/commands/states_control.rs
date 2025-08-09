use tauri::command;
use std::sync::{Arc, Mutex};
use crate::state::registro::Registro;

#[derive(Default)]
pub struct AppState {
    pub modo: Mutex<String>,
    pub puerto_liberado: Mutex<bool>,
    pub lista_texto: Mutex<String>,
    pub registro: Mutex<Registro>,  
    pub conectar_serial: Mutex<bool>, // <-- nueva flag    
}

#[command]
pub fn set_modo(state: tauri::State<Arc<AppState>>, modo: String) {
    let mut modo_lock = state.modo.lock().unwrap();
    *modo_lock = modo;
    println!("Modo cambiado a: {}", *modo_lock);
}

#[command]
pub fn set_puerto_liberado(state: tauri::State<Arc<AppState>>, liberar: bool) {
    let mut puerto_lock = state.puerto_liberado.lock().unwrap();
    *puerto_lock = liberar;
    println!("Puerto liberado: {}", *puerto_lock);
}

#[command]
pub fn set_lista_texto(state: tauri::State<Arc<AppState>>, texto: String) {
    let mut lista_lock = state.lista_texto.lock().unwrap();
    *lista_lock = texto;
    println!("Lista texto actualizado: {}", *lista_lock);
}

#[command]
pub fn set_registro(state: tauri::State<Arc<AppState>>, nombre: String, timestamp: String) {
    let mut registro_lock = state.registro.lock().unwrap();
    registro_lock.nombre = nombre;
    registro_lock.timestamp = timestamp;
    println!("Registro actualizado: {} a las {}", registro_lock.nombre, registro_lock.timestamp);
}

#[command]
pub fn get_estado(state: tauri::State<Arc<AppState>>) -> (String, bool, String) {
    let modo = state.modo.lock().unwrap().clone();
    let puerto = *state.puerto_liberado.lock().unwrap();
    let lista = state.lista_texto.lock().unwrap().clone();
    (modo, puerto, lista)
}

#[command]
pub fn obtener_datos_registro(state: tauri::State<Arc<AppState>>) -> (String, String) {
    let registro = state.registro.lock().unwrap();
    (registro.nombre.clone(), registro.timestamp.clone())
}

#[tauri::command]
pub fn set_conectar_serial(estado: tauri::State<Arc<AppState>>, valor: bool) {
    let mut lock = estado.conectar_serial.lock().unwrap();
    *lock = valor;
    println!("Flag conectar_serial = {}", valor);
}
