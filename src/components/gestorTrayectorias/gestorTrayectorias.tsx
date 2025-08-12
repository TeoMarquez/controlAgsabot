import { useState, useEffect, MouseEvent } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./gestorTrayectorias.css";
import { trayectoriaMock, Trayectoria, PuntoTrayectoria } from "./gestorTrayectorias_Mock";
import { guardarTrayectoria } from "./controllers/guardarTrayectorias.tsx";
import { cargarTrayectoria } from "./controllers/cargarTrayectoria.tsx";
import { useMonitorMock } from "../monitor/monitor_Mock";

interface MenuContextProps {
  visible: boolean;
  x: number;
  y: number;
  puntoIndex: number | null;
}

interface SortableItemProps {
  id: string;
  index: number;
  punto: PuntoTrayectoria;
  seleccionado: boolean;
  ejecutando: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: MouseEvent) => void;
}

function SortableItem({
  id,
  index,
  punto,
  seleccionado,
  ejecutando,
  onClick,
  onDoubleClick,
  onContextMenu,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 999 : "auto",
  };

  const angulosComoTexto = punto.juntas.map((j) => j.grados).join(", ");

  let className = "punto-trayectoria";
  if (ejecutando) className += " ejecutando";
  if (seleccionado) className += " seleccionado";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
      title={`Punto #${index + 1}`}
    >
      <strong>{index + 1}.)</strong> {angulosComoTexto}
    </div>
  );
}

export const GestorTrayectorias = () => {
  const [trayectoria, setTrayectoria] = useState<Trayectoria>(trayectoriaMock);
  const [trayectoriaBase, setTrayectoriaBase] = useState<Trayectoria>(trayectoriaMock);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [ejecutando, setEjecutando] = useState<number | null>(null);

  const [menuContext, setMenuContext] = useState<MenuContextProps>({
    visible: false,
    x: 0,
    y: 0,
    puntoIndex: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const monitorMock = useMonitorMock();

  const actualizarBase = (nuevaTrayectoria: Trayectoria) => {
    const copiaProfunda = JSON.parse(JSON.stringify(nuevaTrayectoria));
    setTrayectoriaBase(copiaProfunda);
    setTrayectoria(copiaProfunda);
  };


  useEffect(() => {
    actualizarBase(trayectoriaMock);
  }, []);

  const hayCambiosSinGuardar =
    JSON.stringify(trayectoria) !== JSON.stringify(trayectoriaBase);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(String(active.id));
      const newIndex = parseInt(String(over.id));

      setTrayectoria((prev) => {
        const newPuntos = arrayMove(prev.puntos, oldIndex, newIndex);
        return { ...prev, puntos: newPuntos };
      });

      if (seleccionado === oldIndex) setSeleccionado(newIndex);
      else if (
        seleccionado !== null &&
        oldIndex < newIndex &&
        seleccionado > oldIndex &&
        seleccionado <= newIndex
      )
        setSeleccionado((i) => (i !== null ? i - 1 : null));
      else if (
        seleccionado !== null &&
        oldIndex > newIndex &&
        seleccionado >= newIndex &&
        seleccionado < oldIndex
      )
        setSeleccionado((i) => (i !== null ? i + 1 : null));

      if (ejecutando === oldIndex) setEjecutando(newIndex);
      else if (
        ejecutando !== null &&
        oldIndex < newIndex &&
        ejecutando > oldIndex &&
        ejecutando <= newIndex
      )
        setEjecutando((i) => (i !== null ? i - 1 : null));
      else if (
        ejecutando !== null &&
        oldIndex > newIndex &&
        ejecutando >= newIndex &&
        ejecutando < oldIndex
      )
        setEjecutando((i) => (i !== null ? i + 1 : null));
    }
  };

  const handleClick = (index: number) => {
    setSeleccionado(index);
    setMenuContext({ ...menuContext, visible: false });
  };

  const handleDoubleClick = (index: number) => {
    setEjecutando(index);
    setSeleccionado(index);
    setMenuContext({ ...menuContext, visible: false });
  };

  const handleContextMenu = (e: MouseEvent, index: number) => {
    e.preventDefault();

    setMenuContext({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      puntoIndex: index,
    });
  };

  const eliminarPunto = () => {
    if (menuContext.puntoIndex === null) return;
    setTrayectoria((prev) => {
      const newPuntos = prev.puntos.filter((_, i) => i !== menuContext.puntoIndex);
      return { ...prev, puntos: newPuntos };
    });
    setMenuContext({ ...menuContext, visible: false });
    if (seleccionado === menuContext.puntoIndex) setSeleccionado(null);
    if (ejecutando === menuContext.puntoIndex) setEjecutando(null);
  };

  const sobreescribirPunto = () => {
    if (menuContext.puntoIndex === null) return;

    const nuevoPunto: PuntoTrayectoria = {
      juntas: monitorMock.juntas.map((j) => ({
        nombre: j.nombre,
        grados: j.grados.trim(),
      })),
    };

    setTrayectoria((prev) => {
      const newPuntos = prev.puntos.map((p, i) =>
        i === menuContext.puntoIndex ? nuevoPunto : p
      );
      const nuevaTrayectoria = { ...prev, puntos: newPuntos };

      return nuevaTrayectoria;
    });

    setMenuContext({ ...menuContext, visible: false });
  };

  const handleGuardar = async () => {
    const trayectoriaActualizada = await guardarTrayectoria(trayectoria);
    if (trayectoriaActualizada) {
      actualizarBase(trayectoriaActualizada);
      toast.success("Trayectoria guardada correctamente.");
    } else {
      toast.error("Error al guardar la trayectoria.");
    }
  };

  const handleClickOutside = () => {
    if (menuContext.visible) setMenuContext({ ...menuContext, visible: false });
  };

  const handleNuevaTrayectoria = async () => {
    if (trayectoria.nombre !== "" || trayectoria.puntos.length > 0) {
      const quiereGuardar = await window.confirm(
        "¿Querés guardar la trayectoria actual antes de crear una nueva?"
      );
      if (quiereGuardar) {
        const guardadoExitoso = await guardarTrayectoria(trayectoria);
        if (guardadoExitoso) {
          actualizarBase({ nombre: "", puntos: [] });
          setSeleccionado(null);
          setEjecutando(null);
        }
      } else {
        const crearNueva = await window.confirm(
          "¿Estás seguro que querés crear una nueva trayectoria sin guardar?"
        );
        if (crearNueva) {
          actualizarBase({ nombre: "", puntos: [] });
          setSeleccionado(null);
          setEjecutando(null);
        }
      }
    } else {
      actualizarBase({ nombre: "", puntos: [] });
      setSeleccionado(null);
      setEjecutando(null);
    }
  };

  const handleCargar = async () => {
    try {
      if (hayCambiosSinGuardar) {
        const quiereGuardar = await window.confirm(
          "Hay cambios sin guardar en la trayectoria actual. ¿Querés guardar antes de cargar otra?"
        );

        if (quiereGuardar) {
          const guardadoExitoso = await guardarTrayectoria(trayectoria);
          if (!guardadoExitoso) {
            toast.error("Error al guardar la trayectoria. No se cargará otra.");
            return; // cancelar carga si no pudo guardar
          }
        }
      }

      const trayectoriaCargada = await cargarTrayectoria();

      if (!trayectoriaCargada) {
        return;
      }

      // Mostrar toast mientras carga
      const idToast = toast.loading("Cargando trayectoria...");

      actualizarBase(trayectoriaCargada);
      setSeleccionado(null);
      setEjecutando(null);

      toast.update(idToast, {
        render: "Trayectoria cargada correctamente.",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

    } catch (error) {
      toast.error("Error al cargar la trayectoria.");
    }
  };


  const handleAñadirPunto = () => {
    const nuevoPunto: PuntoTrayectoria = {
      juntas: monitorMock.juntas.map((j) => ({
        nombre: j.nombre,
        grados: j.grados.trim(), 
      })),
    };

    setTrayectoria((prev) => {
      const nuevaTrayectoria = {
        ...prev,
        puntos: [...prev.puntos, nuevoPunto],
      };
      return nuevaTrayectoria;
    });

    setSeleccionado(trayectoria.puntos.length); 
  };

  return (
    <div className="gestor-container" onClick={handleClickOutside}>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="nombre-trayectoria">Nombre Trayectoria:</label>
        <div
          style={{
            marginLeft: 10,
            padding: "0.25rem 0.5rem",
            border: "1px solid #ccc",
            minHeight: "1.5rem",
            display: "inline-block",
            minWidth: "200px",
            userSelect: "text",
            backgroundColor: "#f9f9f9",
          }}
          title="El nombre se asigna automáticamente al cargar el archivo"
        >
          {trayectoria.nombre || <i>(Sin nombre)</i>}
        </div>
        {hayCambiosSinGuardar && (
          <div style={{ color: "red", fontWeight: "bold", marginTop: 4 }}>
            (Cambios sin guardar)
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={trayectoria.puntos.map((_, i) => i.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="lista-trayectorias">
            {trayectoria.puntos.map((punto, index) => (
              <SortableItem
                key={index}
                id={index.toString()}
                index={index}
                punto={punto}
                seleccionado={index === seleccionado}
                ejecutando={index === ejecutando}
                onClick={() => handleClick(index)}
                onDoubleClick={() => handleDoubleClick(index)}
                onContextMenu={(e) => handleContextMenu(e, index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {menuContext.visible && (
        <ul
          id="menu-contextual-root"
          className="menu-contextual"
          style={{ top: menuContext.y, left: menuContext.x, position: "fixed" }}
        >
          <li onClick={eliminarPunto}>Eliminar punto</li>
          <li onClick={sobreescribirPunto}>Sobreescribir punto</li>
        </ul>
      )}

      <div className="botones-lateral">
        <button onClick={handleGuardar}>Guardar</button>
        <button onClick={handleCargar}>Cargar</button>
        <button onClick={() => void handleNuevaTrayectoria()}>
          Nueva Trayectoria
        </button>
        <button disabled title="Funcionalidad en desarrollo">
          Ejecutar Trayectoria
        </button>
        <button onClick={handleAñadirPunto} title="Añadir Punto">
          Añadir Punto
        </button>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        pauseOnHover={false}
        draggable={true}
        theme="colored"
      />
    </div>
  );
};
