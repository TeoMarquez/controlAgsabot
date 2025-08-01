// src/serial/reader.rs
// src/serial/reader.rs

use std::{sync::{Arc, Mutex}, thread, time::Duration};
use crate::state::registro::Registro;
use serialport::SerialPort;
use std::io::Write;

pub fn iniciar_lectura_serial(puerto: &str, registro: Arc<Mutex<Registro>>) {
    let puerto = puerto.to_string();

    thread::spawn(move || {
        let port_result = serialport::new(&puerto, 9600)
            .timeout(Duration::from_secs(1))
            .open();

        let mut port = match port_result {
            Ok(p) => p,
            Err(e) => {
                eprintln!("Error abriendo puerto serial {}: {}", puerto, e);
                return;
            }
        };

        // Si quieres, puedes enviar un comando inicial para Arduino (opcional)
        // if let Err(e) = port.write_all(b"s\n") {
        //     eprintln!("Error enviando comando inicial al Arduino: {}", e);
        // } else {
        //     println!("Comando inicial enviado al Arduino.");
        // }

        let mut buffer: Vec<u8> = vec![0; 1024];
        let mut acumulador = String::new();

        loop {
            match port.read(buffer.as_mut_slice()) {
                Ok(tam) if tam > 0 => {
                    let data = String::from_utf8_lossy(&buffer[..tam]).to_string();
                    acumulador.push_str(&data);

                    while let Some(pos) = acumulador.find('\n') {
                        let linea = acumulador[..pos].trim().to_string();
                        acumulador.drain(..=pos); // Elimina línea procesada, incluye el '\n'

                        let partes: Vec<&str> = linea.split(',').collect();
                        if partes.len() == 2 {
                            let mut reg = registro.lock().unwrap();
                            reg.nombre = partes[0].to_string();
                            reg.timestamp = partes[1].to_string();
                            println!("Recibido: {} - {}", reg.nombre, reg.timestamp);
                        } else {
                            eprintln!("Línea serial malformada: {}", linea);
                        }
                    }
                }
                Ok(_) => {} // No se leyó nada, ignorar
                Err(ref e) if e.kind() == std::io::ErrorKind::TimedOut => {} // Timeout esperado
                Err(e) => {
                    eprintln!("Error leyendo puerto serial: {}", e);
                    break;
                }
            }

            thread::sleep(Duration::from_millis(100));
        }
    });
}
