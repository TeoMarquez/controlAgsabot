# AGSA-BOT Control Desktop App

> Control profesional de brazo robótico AGSA-BOT con interfaz 3D, monitoreo en tiempo real y gestión de trayectorias.

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


## 🛠 Descripción

1. Seleccioná el puerto USB y el baudrate.
2. Conectá el brazo robótico.
3. Monitoreá juntas y potenciómetros en tiempo real.
4. Agregá puntos de trayectoria y ejecutá movimientos.
5. Exportá logs de comandos enviados para análisis.

---

## 🚀 Instalación

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
