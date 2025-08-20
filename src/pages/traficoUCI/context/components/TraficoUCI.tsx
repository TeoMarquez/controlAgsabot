// src/pages/traficoUCI/components/TraficoUCI.tsx
import { useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemText} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import type { LogEntry } from "../useMockRecibido";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { IconButton } from "@mui/material";
import { save } from "@tauri-apps/plugin-dialog";

interface Props {
  enviados: LogEntry[];
  recibidos: LogEntry[];
}

export default function TraficoUCI({recibidos, enviados }: Props) {
  const [selectedEnviado, setSelectedEnviado] = useState<number | null>(null);
  const [selectedRecibido, setSelectedRecibido] = useState<number | null>(null);


  async function handleDownload() {
    try {
      const now = new Date();
      const timestamp = now
        .toISOString() 
        .replace(/[:.]/g, "-");

      const defaultFileName = `serialLog_received_${timestamp}.txt`;

      const filePath = await save({
        defaultPath: defaultFileName,
        filters: [{ name: "Text", extensions: ["txt"] }],
      });

      if (!filePath) {
        alert("No se seleccionó archivo.");
        return;
      }

      await invoke("export_log", { path: filePath });
      alert("Log exportado correctamente.");
    } catch (error) {
      console.error("Error exportando log:", error);
      alert("Error exportando log.");
    }
  }

  async function handleDownloadEnviados() {
    try {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-");
      const defaultFileName = `serialLog_sent_${timestamp}.txt`;

      const filePath = await save({
        defaultPath: defaultFileName,
        filters: [{ name: "Text", extensions: ["txt"] }],
      });

      if (!filePath) {
        alert("No se seleccionó archivo.");
        return;
      }

      await invoke("export_buffer", { path: filePath });
      alert("Log de enviados exportado correctamente.");
    } catch (error) {
      console.error("Error exportando log de enviados:", error);
      alert("Error exportando log de enviados.");
    }
  }

  const renderList = (items: LogEntry[], selected: number | null, setSelected: (i: number) => void, color: string, hover: string) =>
    items.map((entry, i) => (
      <ListItem
        key={i}
        divider
        onClick={() => setSelected(i)}
        sx={{
          cursor: "pointer",
          backgroundColor: selected === i ? color : "inherit",
          "&:hover": { backgroundColor: hover },
          userSelect: "none",
        }}
      >
        <ListItemText primary={entry.message} secondary={entry.timestamp} />
      </ListItem>
    ));

  return (
    <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2} padding={2} height="100vh" boxSizing="border-box">
      {/* Enviados */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#1976d2" }}>
          <Typography variant="h6" sx={{ color: "white" }}>Mensajes enviados a UCI</Typography>
           <IconButton size="small" onClick={handleDownloadEnviados} sx={{ color: "white" }}>
            <FileDownloadIcon />
          </IconButton>
        </Box>
        <List dense sx={{ flex: 1, overflowY: "auto" }}>
          {renderList(enviados, selectedEnviado, setSelectedEnviado, "#8eb9dcff", "#a9cce6ff")}
        </List>
      </Paper>

      {/* Recibidos */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#388e3c" }}>
          <Typography variant="h6" sx={{ color: "white" }}>Mensajes recibidos desde UCI</Typography>
          <IconButton size="small" onClick={handleDownload} sx={{ color: "white" }}>
            <FileDownloadIcon />
          </IconButton>
        </Box>
        <List dense sx={{ flex: 1, overflowY: "auto" }}>
          {renderList(recibidos, selectedRecibido, setSelectedRecibido, "#a9e2abff", "#cfe2d1ff")}
        </List>
      </Paper>
    </Box>
  );
}
