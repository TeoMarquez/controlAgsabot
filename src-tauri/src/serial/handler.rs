// src/serial/handler.rs

use std::{
    io::Write,
    sync::{
        mpsc::{self, Sender, Receiver, TryRecvError},
        Arc, Mutex,
    },
    thread,
    time::Duration,
};

use tauri::{AppHandle, Manager, Emitter};

// Estado compartido simple con lo mínimo necesario para controlar serial y modo
pub struct SerialSharedState {
    pub puerto_liberado: Mutex<bool>,
    pub puerto: Mutex<String>,     // Ejemplo: "COM6" o "/dev/ttyUSB0"
    pub velocidad: Mutex<u32>,     // Ejemplo: 9600
    pub modo: Mutex<String>,       // Ejemplo: "S", "M"
}

impl SerialSharedState {
    pub fn new(puerto: String, velocidad: u32, modo: String) -> Self {
        Self {
            puerto_liberado: Mutex::new(false),
            puerto: Mutex::new(puerto),
            velocidad: Mutex::new(velocidad),
            modo: Mutex::new(modo),
        }
    }
}

pub struct SerialHandler {
    write_tx: Sender<String>,
    _worker_handle: Option<thread::JoinHandle<()>>,
    shared_state: Arc<SerialSharedState>,
    app_handle: AppHandle,
    ultimo_modo_enviado: Mutex<String>,
}

impl SerialHandler {
    pub fn new(shared_state: Arc<SerialSharedState>, app_handle: AppHandle) -> Self {
        let (write_tx, write_rx) = mpsc::channel();

        let handler = SerialHandler {
            write_tx,
            _worker_handle: None,
            shared_state: shared_state.clone(),
            app_handle: app_handle.clone(),
            ultimo_modo_enviado: Mutex::new(String::new()),
        };

        let worker_handle = thread::spawn(move || {
            Self::serial_worker_loop(shared_state, write_rx, app_handle);
        });

        SerialHandler {
            _worker_handle: Some(worker_handle),
            ..handler
        }
    }

    pub fn escribir(&self, comando: String) -> Result<(), String> {
        let modo_actual = self.shared_state.modo.lock().unwrap().clone();

        let mut ultimo_modo_guard = self.ultimo_modo_enviado.lock().unwrap();

        // Permitir comandos T aunque estemos en stop
        if modo_actual == "S" && comando != "M" && comando != "S" && !comando.starts_with('T') {
            return Err("Modo stop activo: no se envían comandos excepto cambio de modo".into());
        }

        // Evitar enviar repetidamente M o S
        if (comando == "M" || comando == "S") && comando == *ultimo_modo_guard {
            return Err("Comando de modo repetido, no se envía".into());
        }

        let comando_prefijado = match comando.as_str() {
            "M" | "S" => {
                *ultimo_modo_guard = comando.clone();
                format!("{};", comando)
            }
            _ => {
                // Validar comando T
                if comando.starts_with('T') {
                    let partes: Vec<&str> = comando.split(',').collect();
                    if partes.len() == 6 && partes[0] == "T" {
                        let mut valido = true;
                        for v in &partes[1..] {
                            if let Ok(num) = v.parse::<i32>() {
                                if num < 0 || num > 180 {
                                    valido = false;
                                    break;
                                }
                            } else {
                                valido = false;
                                break;
                            }
                        }
                        if valido {
                            format!("{};", comando)
                        } else {
                            return Err("Valores inválidos en comando T".into());
                        }
                    } else {
                        return Err("Formato incorrecto para comando T".into());
                    }
                } else {
                    return Err("Comando desconocido".into());
                }
            }
        };

        self.write_tx
            .send(comando_prefijado)
            .map_err(|e| format!("Error enviando comando: {}", e))
    }


    fn serial_worker_loop(
    shared_state: Arc<SerialSharedState>,
    write_rx: Receiver<String>,
    app_handle: AppHandle,
) {
    let mut port: Option<Box<dyn serialport::SerialPort>> = None;
    let mut buffer: Vec<u8> = vec![0; 1024];
    let mut acumulador = String::new();

    let nombres = ["Cintura", "Hombro", "Codo", "Muñeca", "Pinza"];

    loop {
        let modo = shared_state.modo.lock().unwrap().clone();
        let puerto_liberado = *shared_state.puerto_liberado.lock().unwrap();
        let puerto = shared_state.puerto.lock().unwrap().clone();
        let velocidad = *shared_state.velocidad.lock().unwrap();

        if puerto_liberado {
            if port.is_some() {
                println!("Puerto liberado, cerrando conexión serial.");
                port = None;
            }
            println!("Puerto está liberado, sin conexión activa.");
        } else if port.is_none() {
            match serialport::new(puerto.clone(), velocidad)
                .timeout(Duration::from_millis(500))
                .open()
            {
                Ok(p) => {
                    println!("Puerto serial {} abierto.", puerto);
                    port = Some(p);
                }
                Err(e) => {
                    eprintln!("Error abriendo puerto serial {}: {}", puerto, e);
                    println!("Intentando reconectar en 2 segundos...");
                    thread::sleep(Duration::from_secs(2));
                    continue;
                }
            }
        }

        if let Some(puerto_activo) = port.as_mut() {
            match puerto_activo.read(buffer.as_mut_slice()) {
                Ok(tam) if tam > 0 => {
                    let datos = String::from_utf8_lossy(&buffer[..tam]);
                    acumulador.push_str(&datos);

                    while let Some(pos) = acumulador.find(';') {
                        let linea = acumulador[..pos].trim().to_string();
                        acumulador.drain(..=pos);

                        // Emitir evento raw para frontend
                        if let Err(e) = app_handle.emit("serial-raw", linea.clone()) {
                            eprintln!("Error emitiendo serial-raw: {}", e);
                        }

                        // Parsear y emitir evento parseado
                        let partes: Vec<&str> = linea.split(',').collect();
                        if partes.len() >= 11 {
                            let estado = partes[0].to_string();

                            let mut juntas = Vec::new();

                            for i in 0..5 {
                                let pot_idx = i + 1;
                                let grados_idx = i + 6;

                                let pot_val = partes.get(pot_idx).unwrap_or(&"-").trim().to_string();
                                let grados_val = partes.get(grados_idx).unwrap_or(&"-").trim().to_string();

                                juntas.push(serde_json::json!({
                                    "nombre": nombres[i],
                                    "potenciometro": pot_val,
                                    "grados": grados_val,
                                }));
                            }

                            let payload = serde_json::json!({
                                "estado": estado,
                                "juntas": juntas,
                            });

                            if let Err(e) = app_handle.emit("serial-parser", payload) {
                                eprintln!("Error emitiendo serial-parser: {}", e);
                            }
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

            // Enviar comandos pendientes
            match write_rx.try_recv() {
                Ok(comando) => {
                    if let Err(e) = puerto_activo.write_all(format!("{}\n", comando).as_bytes()) {
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
        } else {
            thread::sleep(Duration::from_millis(500));
            }
        }
    }
}
