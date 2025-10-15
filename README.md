# AGSA-BOT Control Desktop App

> Control de brazo robótico AGSA-BOT con interfaz 3D, monitoreo en tiempo real y gestión de trayectorias.

---

## 🔹 Descripción

AGSA-BOT es una aplicación de escritorio desarrollada en **Rust + Tauri + React**, diseñada para controlar un brazo robótico con **5 articulaciones**: cintura, hombro, codo, muñeca y efector final (pinza).  

La app permite:

- Conexión por puerto USB y control de modo de operación.
- Lectura y envío de comandos serial con validación de rangos.
- Monitoreo en tiempo real de **grados** y **potenciómetros** de cada junta.
- Visualización 3D animable del brazo robótico con control independiente de cada eje.
- Gestión de trayectorias mediante lista interactiva: agregar, eliminar, ejecutar desde cualquier punto.
- **Guardar y cargar trayectorias en archivos JSON**, para fácil edición y reutilización.
- Registro de logs de comandos enviados para auditoría y exportación.
- Compatibilidad con **Windows 10** y **Ubuntu**.

---

## ⚡ Tecnologías

- **Backend:** Rust, Tauri
- **Frontend:** React, Three.js
- **Comunicación:** Serial port (RS232/USB)
- **Logs:** Sistema propio con buffer y exportación a TXT
- **Sistemas soportados:** Windows 10, Ubuntu

---


## 🛠 Funciones

1. Seleccioná el puerto USB y el baudrate.
2. Conectá el brazo robótico.
3. Monitoreá juntas y potenciómetros en tiempo real.
4. Agregá puntos de trayectoria y ejecutá movimientos.
5. Exportá logs de comandos enviados para análisis.
6. Perzonalizá tus trayectorias con el sistema drag and drop y guardalas en JSON

---

## 🚀 Instalación

### Windows
[Descargar AGSA-BOT 0.1.0 (.exe)](https://drive.google.com/file/d/1LQOq12TTluvOw8Jo2wnUkJ2oB2K1xXHq/view?usp=sharing)

### Linux

- **Debian / Ubuntu 64-bit** (.deb)  
[Descargar AGSA-BOT 0.1.0 amd64](https://drive.google.com/file/d/1OtzkAO70l52YoNRL0lHUkKZOdytXQr9q/view?usp=sharing)

- **Fedora / RHEL 64-bit** (.rpm)  
[Descargar AGSA-BOT 0.1.0 x86_64](https://drive.google.com/file/d/1HXcOL18T77HWEMoAGFjITHQi4wfDhMyf/view?usp=sharing)

- **Ubuntu ejecutable**  
[Descargar AGSA-BOT 0.1.1 Ejecutable](https://drive.google.com/file/d/1I_BzAh6fzEU33-FBzZbldwmzjtgCK3yP/view?usp=sharing)

> [!IMPORTANT]  
> 🔹 Si usás **Ubuntu/Debian**, antes de compilar asegurate de instalar las siguientes dependencias del sistema:  
> ```bash
> sudo apt install -y libwebkit2gtk-4.1-dev build-essential libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
> ```

## 🛠 Desarrollo

Antes de clonar el repositorio, asegurate de tener instalados:

- [Rust (incluye cargo)](https://www.rust-lang.org/tools/install)
- [Node.js y npm](https://nodejs.org/)


1. Clonar el repositorio:

```bash
git clone https://github.com/tu-usuario/controlAgsabot.git
cd controlAgsabot
```
2. Instalar dependencias de Tauri y Rust:

```bash
cargo install tauri-cli
npm install
```

3. Ejecutar en modo desarrollo:

```bash
npm run tauri dev
```

---

## 🗂 Estructura del proyecto

### 📁 frontend/src
- **components/**: Todos los componentes React de la app (monitor, panel de trayectorias, control de modos, ventanas secundarias, etc.).
- **assets/**: Imágenes y recursos estáticos, incluyendo partes del brazo robótico.
- **pages/**: Páginas y vistas principales, con sus hooks y contextos.
- **styles/**: Archivos CSS globales y específicos de componentes.

### 📁 src-tauri/src
- **commands/**: Comandos Tauri e invocables desde el frontend, organizados por funcionalidad.
- **serial/**: Manejo de comunicación serial con el brazo robótico.
- **worker_Trajectory/**: Hilos para ejecución de trayectorias.
- **logs/**: Logger de comandos enviados.
- **windowsManager/**: Manejo de ventanas secundarias y tráfico de datos.

---
