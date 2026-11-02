"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  BookMarked,
  CalendarDays,
  Users,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import Marca from "@/components/atoms/marca";
import FotoUsuario from "@/components/atoms/foto-usuario";
import FormularioFoto from "@/components/organisms/formulario-foto";
import { enlaces } from "@/utils/navegacion";
const iconos = [
  LayoutDashboard,
  BookOpen,
  ArrowLeftRight,
  BookMarked,
  CalendarDays,
  Users,
];
const index = ({
  nombre,
  rol,
  foto,
}: {
  nombre: string;
  rol: "ADMIN" | "USER";
  foto: string | null;
}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- El componente usa el nombre index solicitado y se importa con nombre mayusculo.
  const ruta = usePathname();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- Nombre index solicitado; se importa como componente.
  const [error, setError] = useState("");
  const salir = async () => {
    try {
      const r = await fetch("/api/logout", { method: "POST" });
      if (!r.ok) throw new Error();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("No se pudo cerrar la sesión.");
    }
  };
  return (
    <aside className="sidebar">
      <Marca />
      <p className="etiqueta">MI BIBLIOTECA</p>
      <nav aria-label="Navegación principal">
        {enlaces.map((enlace, posicion) => {
          if (enlace.ruta === "/usuarios" && rol !== "ADMIN") return null;
          const Icono = iconos[posicion];
          return (
            <Link
              key={enlace.ruta}
              href={enlace.ruta}
              className={ruta === enlace.ruta ? "enlace activo" : "enlace"}
              aria-current={ruta === enlace.ruta ? "page" : undefined}
            >
              <Icono size={19} />
              {enlace.titulo}
            </Link>
          );
        })}
      </nav>
      <div className="perfil">
        <FotoUsuario nombre={nombre} foto={foto} />
        <div>
          <strong>{nombre}</strong>
          <p>{rol === "ADMIN" ? "Administrador" : "Usuario"}</p>
        </div>
      </div>
      <FormularioFoto nombre={nombre} foto={foto} />
      <Button onClick={salir} className="salir">
        <LogOut size={18} />
        Cerrar sesión
      </Button>
      {error && <p role="alert">{error}</p>}
    </aside>
  );
};
export default index;
