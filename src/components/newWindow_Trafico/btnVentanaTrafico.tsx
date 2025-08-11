import { invoke } from "@tauri-apps/api/core";

interface Props {
  label?: string;
  windowLabel: string;
}

export function BotonVentanaSecundaria({ label = "Abrir ventana", windowLabel }: Props) {
  const abrirVentana = async () => {
    try {
      const resultado = await invoke<string>("abrir_ventana", { label: windowLabel });
      console.log(resultado);
      alert(resultado);
    } catch (error) {
      console.error("Error invocando abrir_ventana", error);
    }
  };

  return (
    <button
      onClick={abrirVentana}
      className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
    >
      {label}
    </button>
  );
}
