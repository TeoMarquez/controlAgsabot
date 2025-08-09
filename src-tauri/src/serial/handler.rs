// src/serial/handler.rs
use std::{
    io::Write,
    sync::{
        mpsc::{self, Receiver, Sender, TryRecvError},
        Arc,
    },
    thread,
    time::Duration,
};
use serialport::SerialPort;
use crate::commands::states_control::AppState;

pub struct SerialHandler {
    write_tx: Sender<String>,
    _worker_handle: Option<thread::JoinHandle<()>>,
    app_state: Arc<AppState>,
}

impl SerialHandler {
    pub fn new(app_state: Arc<AppState>) -> Self {
        let (write_tx, write_rx) = mpsc::channel();

        let handler = SerialHandler {
            write_tx,
            _worker_handle: None,
            app_state: app_state.clone(),
        };

        let worker_handle = thread::spawn(move || {
            Self::serial_worker_loop(app_state, write_rx);
        });

        SerialHandler {
            _worker_handle: Some(worker_handle),
            ..handler
        }
    }

    pub fn escribir(&self, comando: String) -> Result<(), String> {
        let modo = self.app_state.modo.lock().unwrap().clone();

        let comando_prefijado = match modo.as_str() {
            "manual" => format!("MSG {}", comando),
            "automatico" | "stop" => {
                if ["a", "m", "s"].contains(&comando.trim()) {
                    format!("CMD {}", comando.trim())
                } else {
                    return Err("Comando inválido en este modo. Solo se permite: a, m o s.".to_string());
                }
            }
            _ => return Err("Modo desconocido".to_string()),
        };

        self.write_tx
            .send(comando_prefijado)
            .map_err(|e| format!("Error enviando comando: {}", e))
    }

    fn serial_worker_loop(app_state: Arc<AppState>, write_rx: Receiver<String>) {
        let mut port: Option<Box<dyn SerialPort>> = None;
        let mut modo_anterior: String = String::new();
        let mut lista_texto_anterior = String::new();

        let mut buffer: Vec<u8> = vec![0; 1024];
        let mut acumulador = String::new();

        loop {
            let modo = app_state.modo.lock().unwrap().clone();
            let puerto_liberado = *app_state.puerto_liberado.lock().unwrap();
            let lista_texto = app_state.lista_texto.lock().unwrap().clone();
            let conectar_serial = *app_state.conectar_serial.lock().unwrap();  // NUEVO: lee flag conectar_serial

            if !conectar_serial {
            // Si conectar_serial es false, cerramos puerto si está abierto y dormimos
            if port.is_some() {
                println!("Conexión serial desactivada. Cerrando puerto.");
                port = None;
            }

            thread::sleep(Duration::from_millis(500));
            continue;
            
            }
            if puerto_liberado {
                if port.is_some() {
                    println!("Puerto liberado, cerrando conexión serial.");
                    port = None;
                }
            } else if port.is_none() {
                let nombre_puerto = "COM6";

                match serialport::new(nombre_puerto, 9600)
                    .timeout(Duration::from_millis(500))
                    .open()
                {
                    Ok(p) => {
                        println!("Puerto serial {} abierto.", nombre_puerto);
                        port = Some(p);
                    }
                    Err(e) => {
                        eprintln!("Error abriendo puerto serial {}: {}", nombre_puerto, e);
                        thread::sleep(Duration::from_secs(2));
                        continue;
                    }
                }
            }

            if let Some(puerto) = port.as_mut() {
                match puerto.read(buffer.as_mut_slice()) {
                    Ok(tam) if tam > 0 => {
                        let datos = String::from_utf8_lossy(&buffer[..tam]);
                        acumulador.push_str(&datos);

                        while let Some(pos) = acumulador.find('\n') {
                            let linea = acumulador[..pos].trim().to_string();
                            acumulador.drain(..=pos);

                            println!("Recibido serial: {}", linea);

                            // Si es línea con registro tipo "Nombre,timestamp"
                            if let Some((nombre, timestamp)) = linea.split_once(',') {
                                // Actualizamos el registro en estado compartido
                                let mut registro_lock = app_state.registro.lock().unwrap();
                                registro_lock.nombre = nombre.to_string();
                                registro_lock.timestamp = timestamp.to_string();
                                println!("Registro actualizado: {} a las {}", nombre, timestamp);
                            }
                        }
                    }
                    Ok(_) => {}
                    Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {}
                    Err(e) => {
                        eprintln!("Error lectura serial: {}", e);
                        port = None;
                        thread::sleep(Duration::from_secs(1));
                        continue;
                    }
                }

                match write_rx.try_recv() {
                    Ok(comando) => {
                        if let Err(e) = puerto.write_all(format!("{}\n", comando).as_bytes()) {
                            eprintln!("Error escribiendo al serial: {}", e);
                            port = None;
                            thread::sleep(Duration::from_secs(1));
                            continue;
                        } else {
                            println!("Comando enviado: {}", comando);
                        }
                    }
                    Err(TryRecvError::Empty) => {}
                    Err(TryRecvError::Disconnected) => {
                        println!("Canal de escritura desconectado, terminando hilo.");
                        break;
                    }
                }

                if modo != modo_anterior {
                    println!("Modo cambiado: {}", modo);
                    let comando_modo = format!("CMD {}", modo_to_char(&modo));
                    if let Err(e) = puerto.write_all(format!("{}\n", comando_modo).as_bytes()) {
                        eprintln!("Error enviando modo: {}", e);
                    }
                    modo_anterior = modo.clone();
                }

                if lista_texto != lista_texto_anterior && modo == "manual" {
                    println!("Lista de texto cambiada.");
                    if let Err(e) = puerto.write_all(format!("MSG {}\n", lista_texto).as_bytes()) {
                        eprintln!("Error enviando lista: {}", e);
                    }
                    lista_texto_anterior = lista_texto.clone();
                }
            } else {
                thread::sleep(Duration::from_millis(500));
            }
        }
    }
}

fn modo_to_char(modo: &str) -> &str {
    match modo {
        "automatico" => "a",
        "manual" => "m",
        "stop" => "s",
        _ => "?",
    }
}

