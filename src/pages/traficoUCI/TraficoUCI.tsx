import { useState } from "react";
import { Box, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";

interface LogEntry {
  timestamp: string;
  message: string;
}

interface Props {
  enviados: LogEntry[];
  recibidos: LogEntry[];
}

export default function TraficoUCI({ enviados, recibidos }: Props) {
  // Estados para guardar el índice seleccionado en cada lista
  const [selectedEnviado, setSelectedEnviado] = useState<number | null>(null);
  const [selectedRecibido, setSelectedRecibido] = useState<number | null>(null);

  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      gap={2}
      padding={2}
      height="100vh"
      boxSizing="border-box"
    >
      {/* Lista Enviados */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 0,
          maxHeight: "100%",
          borderRight: { md: "1px solid #ccc" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            position: "sticky",
            top: 0,
            backgroundColor: "#1976d2",
            color: "white",
            padding: "12px 16px",
            zIndex: 10,
            borderBottom: "1px solid #1565c0",
          }}
        >
          Mensajes enviados a UCI
        </Typography>
        <List dense sx={{ flexGrow: 1 }}>
          {enviados.map((entry, i) => (
            <ListItem
              key={i}
              divider
              onClick={() => setSelectedEnviado(i)}
              sx={{
                cursor: "pointer",
                backgroundColor: selectedEnviado === i ? "#8eb9dcff" : "inherit", // azul suave si seleccionado
                "&:hover": {
                  backgroundColor: "#a9cce6ff", // azul muy pálido al pasar mouse
                },
                userSelect: "none",
              }}
            >
              <ListItemText
                primary={entry.message}
                secondary={entry.timestamp}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Lista Recibidos */}
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 0,
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            position: "sticky",
            top: 0,
            backgroundColor: "#388e3c",
            color: "white",
            padding: "12px 16px",
            zIndex: 10,
            borderBottom: "1px solid #2e7d32",
          }}
        >
          Mensajes recibidos desde UCI
        </Typography>
        <List dense sx={{ flexGrow: 1 }}>
          {recibidos.map((entry, i) => (
            <ListItem
              key={i}
              divider
              onClick={() => setSelectedRecibido(i)}
              sx={{
                cursor: "pointer",
                backgroundColor: selectedRecibido === i ? "#a9e2abff" : "inherit", // verde suave si seleccionado
                "&:hover": {
                  backgroundColor: "#cfe2d1ff", // verde muy pálido al pasar mouse
                },
                userSelect: "none",
              }}
            >
              <ListItemText
                primary={entry.message}
                secondary={entry.timestamp}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
