import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

interface Props {
  label?: string;
  windowLabel: string;
}

export function BotonVentanaSecundaria({ label = "Abrir ventana", windowLabel }: Props) {
  const [visible, setVisible] = useState(false);

  const toggleVentana = async () => {
    try {
      if (visible) {
        await invoke("ocultar_ventana", { label: windowLabel });
      } else {
        await invoke("abrir_ventana", { label: windowLabel });
      }
    } catch (error) {
      console.error("Error invocando toggle ventana", error);
    }
  };

  useEffect(() => {
    const unlisten = listen<[string, boolean]>("window-visibility-changed", (event) => {
      const [label, isVisible] = event.payload;
      if (label === windowLabel) {
        setVisible(isVisible);
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [windowLabel]);

  return (
    <button
      onClick={toggleVentana}
      className={`px-4 py-2 rounded text-white transition duration-300 ease-in-out ${
        visible
          ? "bg-blue-600 text-white font-bold shadow-lg transform scale-105"
          : "bg-blue-400 text-blue-800 hover:bg-blue-300 hover:text-white"
      }`}
    >
      {visible ? "Ocultar" : "Abrir"} {label}
    </button>
  );
}
