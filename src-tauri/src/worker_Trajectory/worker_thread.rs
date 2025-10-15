use crate::serial::handler::SerialHandler;
use crate::commands::trayectorias::trajectory_handle::TrayectoriaQueue;
use std::{
    sync::{Arc},
    thread,
    time::Duration,
};

pub fn start_trayectoria_worker(
    serial: Arc<SerialHandler>,
    queue: Arc<TrayectoriaQueue>,
) {
    thread::spawn(move || loop {
        let siguiente_punto = {
            let mut puntos = queue.puntos.lock().unwrap();
            if puntos.is_empty() {
                None
            } else {
                Some(puntos.remove(0)) // Tomamos el primer punto y lo eliminamos de la cola
            }
        };

        if let Some(punto) = siguiente_punto {
            println!("Ejecutando punto: {}", punto);

            // Enviar al SerialHandler
            match serial.escribir(punto.clone()) {
                Ok(_) => println!("Punto enviado correctamente."),
                Err(e) => {
                    eprintln!("Error enviando punto: {}", e);
                    // En caso de error podríamos reencolarlo o abortar
                    continue;
                }
            }

            thread::sleep(Duration::from_millis(1200));

        } else {
            // No hay puntos pendientes, esperar un poco antes de revisar de nuevo
            thread::sleep(Duration::from_millis(100));
        }
    });
}
