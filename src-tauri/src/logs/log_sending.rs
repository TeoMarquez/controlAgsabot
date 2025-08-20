use std::sync::mpsc::{self, Sender, Receiver};
use std::thread;
use std::fs::File;
use std::io::Write;

#[derive(Clone, Debug)]
pub struct LogEntry {
    pub timestamp: String,
    pub message: String,
}

pub enum LogCommand {
    NewMessage(LogEntry),
    DumpToFile(String), 
}

#[tauri::command]
pub fn export_log(sender: tauri::State<Sender<LogCommand>>, path: String) -> Result<String, String> {
    sender.send(LogCommand::DumpToFile(path))
        .map_err(|e| e.to_string())?;
    Ok("Exportación iniciada".into())
}

pub fn start_logger_thread() -> Sender<LogCommand> {
    let (tx, rx): (Sender<LogCommand>, Receiver<LogCommand>) = mpsc::channel();

    thread::spawn(move || {
        let mut buffer: Vec<LogEntry> = Vec::new();

        while let Ok(cmd) = rx.recv() {
            match cmd {
                LogCommand::NewMessage(entry) => {
                    buffer.push(entry);
                    if buffer.len() > 10000 {
                        buffer.drain(0..buffer.len() - 10000);
                    }
                }
                LogCommand::DumpToFile(path) => {
                    match File::create(&path) {
                        Ok(mut file) => {
                            for entry in &buffer {
                                if let Err(e) = writeln!(file, "{} - {}", entry.timestamp, entry.message) {
                                    eprintln!("Error escribiendo log: {}", e);
                                }
                            }
                        }
                        Err(e) => eprintln!("No se pudo crear el archivo: {} ({})", path, e),
                    }
                }
            }
        }
    });

    tx
}